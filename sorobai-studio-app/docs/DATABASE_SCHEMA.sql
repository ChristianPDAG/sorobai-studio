-- =============================================
-- SOROBAI STUDIO - DATABASE SCHEMA
-- Supabase PostgreSQL
-- =============================================

-- =============================================
-- PROFILES (extiende auth.users de Supabase)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  github_username TEXT,
  github_avatar_url TEXT,
  stellar_address TEXT,
  credits DECIMAL(18, 7) DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Users can read all profiles, update only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- PROJECTS
-- =============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT DEFAULT '',
  language TEXT DEFAULT 'rust' CHECK (language IN ('rust', 'typescript')),
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  forked_from UUID REFERENCES projects(id),
  github_repo_url TEXT,
  deployed_address TEXT,
  deployed_network TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PROJECT LIKES (para el Hub)
-- =============================================
CREATE TABLE project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON project_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like"
  ON project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes"
  ON project_likes FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- CHAT SESSIONS (historial de IA por proyecto)
-- =============================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  messages JSONB DEFAULT '[]',
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Solo el dueño del proyecto puede ver/editar
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own project chats"
  ON chat_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chat_sessions.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =============================================
-- CREDIT TRANSACTIONS
-- =============================================
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(18, 7) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'reward', 'refund')),
  description TEXT,
  stellar_tx_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- BOUNTIES (Fase v1.0)
-- =============================================
CREATE TABLE bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  developer_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget DECIMAL(18, 2) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'review', 'completed', 'disputed', 'cancelled')),
  escrow_address TEXT,
  escrow_tx_hash TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open bounties"
  ON bounties FOR SELECT USING (status = 'open' OR auth.uid() = client_id OR auth.uid() = developer_id);

CREATE POLICY "Authenticated users can create bounties"
  ON bounties FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own bounties"
  ON bounties FOR UPDATE USING (auth.uid() = client_id);

-- =============================================
-- BOUNTY PROPOSALS
-- =============================================
CREATE TABLE bounty_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE NOT NULL,
  developer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  proposal_text TEXT NOT NULL,
  estimated_days INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bounty_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bounty participants can view proposals"
  ON bounty_proposals FOR SELECT
  USING (
    auth.uid() = developer_id OR
    EXISTS (
      SELECT 1 FROM bounties
      WHERE bounties.id = bounty_proposals.bounty_id
      AND bounties.client_id = auth.uid()
    )
  );

CREATE POLICY "Developers can create proposals"
  ON bounty_proposals FOR INSERT WITH CHECK (auth.uid() = developer_id);

-- =============================================
-- COMMENTS (para Hub y Bounties)
-- =============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id),
  content TEXT NOT NULL,
  line_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (project_id IS NOT NULL AND bounty_id IS NULL) OR
    (project_id IS NULL AND bounty_id IS NOT NULL)
  )
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on public projects"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = comments.project_id
      AND projects.is_public = true
    ) OR
    auth.uid() = user_id
  );

CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bounties_updated_at
  BEFORE UPDATE ON bounties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, github_username, github_avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update likes_count on project
CREATE OR REPLACE FUNCTION update_project_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET likes_count = likes_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET likes_count = likes_count - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_likes_count_trigger
  AFTER INSERT OR DELETE ON project_likes
  FOR EACH ROW EXECUTE FUNCTION update_project_likes_count();

-- Update forks_count when project is forked
CREATE OR REPLACE FUNCTION update_project_forks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.forked_from IS NOT NULL THEN
    UPDATE projects SET forks_count = forks_count + 1 WHERE id = NEW.forked_from;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_forks_count_trigger
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION update_project_forks_count();

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_is_public ON projects(is_public);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);
CREATE INDEX idx_chat_sessions_project_id ON chat_sessions(project_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_bounties_status ON bounties(status);
CREATE INDEX idx_bounties_client_id ON bounties(client_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_bounty_id ON comments(bounty_id);
