export type Plan = "free" | "premium" | "admin";
export type RiskProfile = "conservative" | "smart" | "aggressive" | "pro" | "profesional";
export type PickStatus = "pending" | "won" | "lost" | "void" | "cashout";

export interface ApiOkResponse {
  ok: boolean;
  error?: string;
}

export interface User {
  id?: number;
  email?: string;
  username?: string;
  plan: Plan;
  bankroll?: number;
  currency?: string;
  risk_profile?: RiskProfile;
  kelly_fraction?: number;
  max_stake_pct?: number;
  en_juego?: number;
  disponible?: number;
}

export interface LoginResponse extends ApiOkResponse {
  token?: string;
  plan?: Plan;
  username?: string;
}

export interface Pick {
  id?: string | number;
  event: string;
  pick_team: string;
  sport?: string;
  league?: string;
  market?: string;
  odds_ref?: number;
  odds_real?: number;
  odds_cashout?: number;
  stake_usd?: number;
  potential_profit?: number;
  edge?: number;
  adjusted_prob?: number;
  model_prob?: number;
  gold_score?: number;
  is_gold?: boolean;
  categoria?: string;
  has_pinnacle?: boolean;
  context_desc?: string;
  context_id?: string;
  local_time?: string;
  hours_until_start?: number;
  confidence_pct?: number;
  confidence_level?: string;
  signals?: string;
  senales?: string;
  prob_pinnacle?: number;
  prob_consensus?: number;
  discarded?: boolean;
  discard_reason?: string;
  type?: string;
  bankroll_engine?: number;
  placed_at?: string;
  resulted_at?: string;
  status?: PickStatus;
  pnl?: number;
  is_cashout?: boolean;
}

export interface PicksResponse {
  scanning?: boolean;
  gold_tips?: Pick[];
  valid_picks?: Pick[];
  sure_bets?: Pick[];
  live_picks?: Pick[];
  futures_picks?: Pick[];
  discarded_picks?: Pick[];
  bankroll?: number;
  currency?: string;
  min_edge_pct?: number;
  window_hours?: number;
  total_events?: number;
  roi_gold_potencial?: number;
  roi_sure_potencial?: number;
  blocked_picks?: number;
  last_scan?: string;
}

export interface StatsBreakdown {
  total?: number;
  win_rate?: number;
  roi?: number;
  pnl?: number;
  confidence?: string;
}

export interface PeriodStats {
  total_placed?: number;
  total_resolved?: number;
  pending_picks?: number;
  won?: number;
  lost?: number;
  cashouts?: number;
  win_rate?: number;
  roi?: number;
  growth_roi?: number;
  pnl_total?: number;
  staked_pending?: number;
  staked_resolved?: number;
  gold_stats?: StatsBreakdown;
  sure_stats?: StatsBreakdown;
  value_stats?: StatsBreakdown;
  by_sport?: Record<string, StatsBreakdown>;
  by_market?: Record<string, StatsBreakdown>;
  by_category?: Record<string, StatsBreakdown>;
  by_league?: Record<string, StatsBreakdown>;
  by_odds_range?: Record<string, StatsBreakdown>;
}

export interface BankrollHistoryEntry {
  id: number;
  type: string;
  amount: number;
  description?: string;
  created_at?: string;
}

export interface StatsResponse {
  bankroll?: number;
  currency?: string;
  ratio?: number;
  daily_roi?: number;
  active_days?: number;
  pending_picks?: Pick[];
  history?: Pick[];
  bankroll_hist?: BankrollHistoryEntry[];
  mes?: PeriodStats;
  todo?: PeriodStats;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  plan: Plan;
  bankroll?: number;
  risk_profile?: string;
  tg_active?: boolean;
  active?: boolean;
  registered_at?: string;
}

export interface Invitation {
  code: string;
  plan: Plan;
  current_uses: number;
  max_uses: number;
  used: boolean;
  created_at?: string;
}

export interface AdminSettings {
  window_hours: number;
  overridden?: boolean;
}

export interface PlacedCache {
  exactos: Set<string>;
  events: Set<string>;
  opuestos: Set<string>;
  ts: number;
}

export interface AutoResultSuggestion {
  pick_db_id: number;
  suggested: "won" | "lost" | "push" | "undetermined";
  score_home?: number;
  score_away?: number;
  reason?: string;
}
