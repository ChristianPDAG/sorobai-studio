"""
Validadores para código generado por el RAG.
Detectan patrones incorrectos y sugieren correcciones.
"""

from typing import Dict, List, Optional
import re


class CodeValidationResult:
    """Resultado de validación de código"""
    def __init__(self, is_valid: bool, errors: List[str] = None, warnings: List[str] = None):
        self.is_valid = is_valid
        self.errors = errors or []
        self.warnings = warnings or []
    
    def __bool__(self):
        return self.is_valid
    
    def __repr__(self):
        return f"CodeValidationResult(valid={self.is_valid}, errors={len(self.errors)}, warnings={len(self.warnings)})"


def validate_token_contract(code: str) -> CodeValidationResult:
    """
    Valida que un contrato de token siga las reglas correctas.
    
    Detecta TODOS los antipatrones del documento examples_token_antipattern.md:
    1. Self-Client (Recursión Innecesaria)
    2. Zombie Storage (Ignorar TTL)
    3. Fake Auth (Verificación Manual)
    4. Panic por Todo
    5. Initialización Abierta (Front-Running)
    6. Cálculo Pesado antes de Auth (Gas Griefing)
    
    Soporta dos casos:
    - Caso A: Token usando TokenInterface (validación estricta)
    - Caso B: Token custom sin TokenInterface (validación flexible)
    """
    errors = []
    warnings = []
    
    # ANTIPATRÓN 1: Self-Client (Recursión Innecesaria)
    # Detectar token::Client::new(&e, &e.current_contract_address())
    if re.search(r'token::Client::new\([^)]*current_contract_address', code):
        errors.append(
            "❌ [ANTIPATRÓN #1: Self-Client] Detectado uso de token::Client para llamarse a sí mismo. "
            "Esto causa costos de gas innecesarios y posible recursión. "
            "SOLUCIÓN: Accede directamente al storage o llama a funciones internas."
        )
    
    # Detectar cualquier uso sospechoso de Client dentro del propio contrato
    if re.search(r'let\s+client\s*=\s*token::Client::new', code) and 'current_contract_address' in code:
        warnings.append(
            "⚠️  [ANTIPATRÓN #1] Uso de token::Client detectado. "
            "Verifica que NO estés llamando al propio contrato (self-client antipattern)."
        )
    
    # ANTIPATRÓN 2: Zombie Storage (Ignorar TTL)
    # Detectar storage.set() sin extend_ttl
    storage_set_pattern = r'(persistent|temporary|instance)\(\)\.set\('
    storage_sets = re.findall(storage_set_pattern, code)
    
    if storage_sets:
        # Verificar que exista extend_ttl cerca (misma función)
        functions_with_set = re.findall(r'fn\s+\w+[^{]*\{[^}]*(?:persistent|temporary|instance)\(\)\.set\([^}]*\}', code, re.DOTALL)
        
        for func in functions_with_set:
            if '.set(' in func and 'extend_ttl' not in func:
                errors.append(
                    "❌ [ANTIPATRÓN #2: Zombie Storage] Detectado storage.set() sin extend_ttl(). "
                    "Los datos pueden expirar y ser archivados. "
                    "SOLUCIÓN: Siempre llama a extend_ttl() después de set() para Persistent/Temporary storage."
                )
                break  # Solo reportar una vez
    
    # Detectar get() sin extend_ttl para Persistent storage
    if re.search(r'persistent\(\)\.get\(', code):
        functions_with_get = re.findall(r'fn\s+\w+[^{]*\{[^}]*persistent\(\)\.get\([^}]*\}', code, re.DOTALL)
        
        for func in functions_with_get:
            if '.get(' in func and 'extend_ttl' not in func:
                warnings.append(
                    "⚠️  [ANTIPATRÓN #2] Detectado persistent().get() sin extend_ttl(). "
                    "Considera extender el TTL al leer datos críticos."
                )
                break
    
    # ANTIPATRÓN 3: Fake Auth (Verificación Manual)
    # Detectar comparaciones de Address sin require_auth
    if re.search(r'if\s+\w+\s*==\s*\w+.*Address', code) and 'require_auth' not in code:
        errors.append(
            "❌ [ANTIPATRÓN #3: Fake Auth] Detectada comparación manual de Address sin require_auth(). "
            "Esto NO verifica criptográficamente la identidad. "
            "SOLUCIÓN: Usa address.require_auth() para verificar firmas."
        )
    
    # Detectar funciones con Address pero sin require_auth
    transfer_functions = re.findall(r'fn\s+(transfer|mint|burn|spend|approve)\s*\([^)]*from:\s*Address[^}]+\}', code, re.DOTALL)
    for func in transfer_functions:
        if 'require_auth' not in func:
            errors.append(
                f"❌ [ANTIPATRÓN #3: Fake Auth] Función con parámetro Address 'from' sin require_auth(). "
                "Cualquiera puede llamar esta función pasando la dirección de otra persona. "
                "SOLUCIÓN: Agrega from.require_auth() al inicio de la función."
            )
            break
    
    # ANTIPATRÓN 4: Panic por Todo
    # Detectar panic! en lógica de negocio (muchos panics sin Result)
    panic_count = len(re.findall(r'\bpanic!\(', code))
    has_result_type = bool(re.search(r'Result<', code))
    has_contract_error = bool(re.search(r'#\[contracterror\]', code))
    
    if panic_count > 3 and not (has_result_type or has_contract_error):
        errors.append(
            f"❌ [ANTIPATRÓN #4: Panic por Todo] Detectados {panic_count} usos de panic!() sin manejo de errores. "
            "Los clientes reciben errores genéricos sin saber qué falló. "
            "SOLUCIÓN: Define un enum con #[contracterror] y retorna Result<T, Error>."
        )
    
    # Detectar panic! en validaciones comunes
    common_panics = [
        (r'panic!\([^)]*"negative', 'cantidad negativa'),
        (r'panic!\([^)]*"insufficient', 'balance insuficiente'),
        (r'panic!\([^)]*"unauthorized', 'no autorizado'),
    ]
    
    for pattern, error_type in common_panics:
        if re.search(pattern, code, re.IGNORECASE):
            warnings.append(
                f"⚠️  [ANTIPATRÓN #4] Detectado panic!() para '{error_type}'. "
                "Considera usar #[contracterror] con códigos de error específicos."
            )
            break
    
    # ANTIPATRÓN 5: Initialización Abierta (Front-Running)
    # Detectar función initialize sin protección
    init_functions = re.findall(r'fn\s+(initialize|__constructor)\s*\([^}]+\}', code, re.DOTALL)
    
    for func in init_functions:
        # Verificar que compruebe si ya fue inicializado
        has_check = bool(re.search(r'has\(|get\(.*Admin|initialized', func))
        
        if not has_check:
            errors.append(
                "❌ [ANTIPATRÓN #5: Initialización Abierta] Función initialize() sin verificación. "
                "Un atacante puede front-run y llamar a initialize antes que tú. "
                "SOLUCIÓN: Verifica storage.has(&DataKey::Admin) antes de inicializar."
            )
    
    # ANTIPATRÓN 6: Cálculo Pesado antes de Auth (Gas Griefing)
    # Detectar funciones donde require_auth está muy abajo
    functions_with_auth = re.findall(
        r'(fn\s+\w+\s*\([^)]*Address[^{]*\{(?:[^}]|\n){50,}?require_auth)',
        code,
        re.DOTALL
    )
    
    for func in functions_with_auth:
        # Contar líneas antes de require_auth
        lines_before_auth = func[:func.index('require_auth')].count('\n')
        
        if lines_before_auth > 5:
            warnings.append(
                f"⚠️  [ANTIPATRÓN #6: Gas Griefing] require_auth() está muy abajo en la función (~{lines_before_auth} líneas). "
                "Ejecutar lógica costosa antes de verificar autorización desperdicia recursos. "
                "SOLUCIÓN: Mueve require_auth() al INICIO de la función (fail fast)."
            )
            break
    
    # Verificar si implementa TokenInterface
    implements_token_interface = bool(re.search(r'impl\s+TokenInterface', code))
    
    if implements_token_interface:
        # CASO A: Token usando TokenInterface - Validación ESTRICTA adicional
        
        # Error: Funciones helper custom de balances
        custom_balance_functions = [
            'spend_balance', 'receive_balance', 'get_balance', 
            'set_balance', 'add_balance', 'subtract_balance',
            'read_balance', 'write_balance'
        ]
        
        for func in custom_balance_functions:
            if re.search(rf'\bfn\s+{func}\b', code):
                errors.append(
                    f"❌ [CASO A] Detectada función custom '{func}'. "
                    f"TokenInterface maneja balances internamente. "
                    f"NO debes implementar funciones de balance personalizadas."
                )
        
        # Error: Storage manual de balances
        if re.search(r'DataKey::Balance\(', code):
            errors.append(
                "❌ [CASO A] Detectado storage manual de balances (DataKey::Balance). "
                "TokenInterface gestiona el storage internamente. "
                "NO debes acceder directamente al storage de balances."
            )
        
        # Error: Uso de Symbol en vez de String
        if re.search(r'fn\s+initialize\([^)]*name:\s*Symbol', code):
            errors.append(
                "❌ [CASO A] Detectado uso de 'Symbol' para 'name' en initialize(). "
                "DEBE usar 'String' según TokenInterface. "
                "Cambiar: name: Symbol → name: String"
            )
        
        if re.search(r'fn\s+initialize\([^)]*symbol:\s*Symbol', code):
            errors.append(
                "❌ [CASO A] Detectado uso de 'Symbol' para 'symbol' en initialize(). "
                "DEBE usar 'String' según TokenInterface. "
                "Cambiar: symbol: Symbol → symbol: String"
            )
    
    else:
        # CASO B: Token Custom sin TokenInterface - Validación FLEXIBLE
        
        # Info: Es un token custom
        if 'token' in code.lower() or 'balance' in code.lower():
            warnings.append(
                "ℹ️  [CASO B] Token custom sin TokenInterface detectado. "
                "Asegúrate de que esta complejidad es necesaria. "
                "Para tokens estándar, considera usar TokenInterface."
            )
    
    # Validaciones generales adicionales
    
    # Warning: Falta #![no_std]
    if '#![no_std]' not in code and 'contract' in code.lower():
        warnings.append(
            "⚠️  Falta directiva '#![no_std]' al inicio. "
            "Los contratos Soroban deben ser no_std."
        )
    
    is_valid = len(errors) == 0
    
    return CodeValidationResult(is_valid, errors, warnings)


def validate_soroban_code(code: str, contract_type: Optional[str] = None) -> CodeValidationResult:
    """
    Validación general de código Soroban.
    
    Args:
        code: Código Rust a validar
        contract_type: Tipo de contrato ("token", "nft", "custom", etc.)
    """
    
    # Detectar automáticamente si es un token
    if contract_type is None:
        if 'TokenInterface' in code or 'token' in code.lower():
            contract_type = "token"
    
    # Validación específica por tipo
    if contract_type == "token":
        return validate_token_contract(code)
    
    # Validación general para otros contratos
    errors = []
    warnings = []
    
    # Check básico: sintaxis de contrato
    if '#[contract]' not in code and 'pub struct' in code:
        errors.append(
            "❌ Falta anotación #[contract] en la estructura del contrato."
        )
    
    if '#[contractimpl]' not in code and 'impl' in code and 'contract' in code.lower():
        errors.append(
            "❌ Falta anotación #[contractimpl] en la implementación."
        )
    
    # Warnings sobre mejores prácticas
    if 'require_auth' not in code and ('transfer' in code.lower() or 'spend' in code.lower()):
        warnings.append(
            "⚠️  No se detectó uso de require_auth() en operaciones sensibles. "
            "Verifica la seguridad del contrato."
        )
    
    is_valid = len(errors) == 0
    
    return CodeValidationResult(is_valid, errors, warnings)


def format_validation_message(result: CodeValidationResult) -> str:
    """
    Formatea el resultado de validación en un mensaje legible.
    """
    if result.is_valid and not result.warnings:
        return "✅ Código validado correctamente."
    
    parts = []
    
    if result.errors:
        parts.append("🔴 ERRORES DETECTADOS:\n")
        for i, error in enumerate(result.errors, 1):
            parts.append(f"{i}. {error}\n")
    
    if result.warnings:
        if parts:
            parts.append("\n")
        parts.append("⚠️  ADVERTENCIAS:\n")
        for i, warning in enumerate(result.warnings, 1):
            parts.append(f"{i}. {warning}\n")
    
    return "".join(parts)


def should_validate_code(query: str) -> bool:
    """
    Determina si una query requiere validación de código.
    """
    code_keywords = [
        'token', 'contract', 'generar', 'crear', 'implementar',
        'generate', 'create', 'implement', 'write', 'code'
    ]
    
    return any(kw in query.lower() for kw in code_keywords)
