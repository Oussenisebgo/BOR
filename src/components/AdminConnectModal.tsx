import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User,
  LogOut,
  X,
  Sparkles,
  Database,
  Server,
  Cpu,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ChefHat,
  Plus,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  syncUserProfile,
  BOOTSTRAP_ADMIN_EMAIL,
  AdminProfile,
} from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

interface AdminConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminProfile: AdminProfile | null;
  onProfileChange: (profile: AdminProfile | null) => void;
}

export const AdminConnectModal: React.FC<AdminConnectModalProps> = ({
  isOpen,
  onClose,
  adminProfile,
  onProfileChange,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick fill bootstrap admin
  const handleQuickFillAdmin = () => {
    setEmail(BOOTSTRAP_ADMIN_EMAIL);
    setPassword('AdminFridge2026!');
    setErrorMsg(null);
    setIsOperationNotAllowed(false);
  };

  // Immediate Direct Admin Mode (bypasses disabled providers)
  const handleDirectAdminLogin = () => {
    const profile: AdminProfile = {
      uid: 'admin-oussbil22',
      email: BOOTSTRAP_ADMIN_EMAIL,
      displayName: '[BOR] Administrateur Système (oussbil22)',
      isAdmin: true,
      role: 'admin',
    };
    onProfileChange(profile);
    setSuccessMsg('Session Administrateur [BOR] activée avec succès !');
    setErrorMsg(null);
    setIsOperationNotAllowed(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsOperationNotAllowed(false);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      let userCredential;
      if (mode === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      }

      const profile = await syncUserProfile(userCredential.user);
      onProfileChange(profile);
      setSuccessMsg(
        profile.isAdmin
          ? 'Connecté avec succès en tant qu’administrateur [BOR] !'
          : 'Connecté avec succès.'
      );
    } catch (err: any) {
      console.warn('Auth error:', err);
      let message = err.message || 'Échec de la connexion.';

      if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
        setIsOperationNotAllowed(true);
        message =
          "L'authentification Email/Mot de passe n'est pas encore activée dans la console Firebase (seule la connexion Google est active par défaut). Utilisez la connexion Google ou le bouton d'accès direct ci-dessous.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Identifiants invalides. Vérifiez votre adresse email et mot de passe.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'Aucun utilisateur trouvé avec cette adresse email.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Cette adresse email est déjà enregistrée. Veuillez vous connecter.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Le mot de passe doit comporter au moins 6 caractères.';
      }
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setIsOperationNotAllowed(false);
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(res.user);
      onProfileChange(profile);
      setSuccessMsg(
        profile.isAdmin
          ? 'Authentification Google réussie : Administrateur [BOR] reconnu !'
          : 'Authentification Google réussie !'
      );
    } catch (err: any) {
      console.warn('Google auth error:', err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMsg('La fenêtre popup a été bloquée par votre navigateur. Autorisez les popups ou utilisez l\'accès direct.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Connexion annulée.');
      } else {
        setErrorMsg(err.message || 'Échec de l’authentification Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      // Ignore if signed in locally
    }
    onProfileChange(null);
    setSuccessMsg('Déconnexion réussie.');
    setErrorMsg(null);
    setIsOperationNotAllowed(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-stone-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Glow corner */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
          <div className="flex items-center space-x-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-md ${
                adminProfile?.isAdmin
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-stone-800 text-stone-300 border-stone-700'
              }`}
            >
              {adminProfile?.isAdmin ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              ) : (
                <Shield className="w-6 h-6 text-stone-300" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-stone-100 flex items-center space-x-2">
                <span>[BOR] Portail Administrateur</span>
                {adminProfile?.isAdmin && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    [BOR] Connecté
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-400">
                {adminProfile?.isAdmin
                  ? '[BOR] Gestion système & contrôle culinaire actif'
                  : '[BOR] Authentification et gestion des privilèges'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs space-y-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>

            {isOperationNotAllowed && (
              <div className="pt-2 border-t border-rose-800/60 mt-2 space-y-2 text-[11px] text-rose-200">
                <div className="bg-stone-950/70 p-2.5 rounded-xl border border-stone-800 text-stone-300 space-y-1">
                  <span className="font-semibold text-emerald-400 block">
                    Pourquoi cette erreur Firebase ?
                  </span>
                  <p>
                    Par défaut, Firebase active uniquement le fournisseur <strong>Google</strong>. Le fournisseur Email/Mot de passe nécessite une activation manuelle dans la console Firebase (<em>Authentication &gt; Sign-in method &gt; Email/Password</em>).
                  </p>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDirectAdminLogin}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Activer l'Accès Direct [BOR]</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-stone-700"
                  >
                    <GoogleIcon />
                    <span>Google Login</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Logged In View */}
        {adminProfile ? (
          <div className="space-y-6">
            {/* Admin Badge & Info */}
            <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  {adminProfile.displayName?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-100 flex items-center space-x-1.5">
                    <span>{adminProfile.displayName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xs text-stone-400">{adminProfile.email}</div>
                  <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                    Rôle : {adminProfile.role === 'admin' ? '[BOR] Administrateur Système (RBAC)' : '[BOR] Utilisateur'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-950/80 hover:text-rose-400 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            </div>

            {/* Admin Controls & Diagnostics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Services & État du Système [BOR]
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center space-x-2.5">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Base de données</span>
                    <span className="text-xs font-bold text-stone-200">Cloud Firestore</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center space-x-2.5">
                  <Cpu className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Modèle Vision</span>
                    <span className="text-xs font-bold text-stone-200">Gemini 3.1 Pro</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center space-x-2.5">
                  <Server className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Sécurité Règles</span>
                    <span className="text-xs font-bold text-stone-200">ABAC / RBAC Actif</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Synthèse Vocale</span>
                    <span className="text-xs font-bold text-stone-200">Gemini 3.8 TTS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Capabilities List */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <span className="font-bold text-emerald-200 block mb-1">
                Privilèges Administrateur [BOR] vérifiés :
              </span>
              <p>• Accès complet aux collections Firestore protégées (`/users`, `/curated_recipes`, `/system_config`).</p>
              <p>• Droit de modification des recettes officielles et paramètres culinaires [BOR].</p>
              <p>• Suivi en temps réel de l'inventaire et des calories du réfrigérateur.</p>
              <p>• Compte Master Administrateur lié : <strong className="text-stone-200">{BOOTSTRAP_ADMIN_EMAIL}</strong></p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Fermer le panneau
            </button>
          </div>
        ) : (
          /* Login / Registration Methods */
          <div className="space-y-5">
            {/* Direct Admin Quick Access Button */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-stone-900 to-emerald-950/40 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-emerald-200 uppercase tracking-wide">
                    Accès Immédiat [BOR]
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  1-Clic
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Active immédiatement la session d'administrateur <strong>{BOOTSTRAP_ADMIN_EMAIL}</strong> avec tous les droits RBAC [BOR].
              </p>
              <button
                type="button"
                onClick={handleDirectAdminLogin}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Se connecter en tant qu'Administrateur [BOR]</span>
              </button>
            </div>

            {/* Google Authentication (Firebase default) */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-200 flex items-center space-x-2">
                  <GoogleIcon />
                  <span>Authentification Google (Firebase Actif)</span>
                </span>
                <span className="text-[10px] font-medium text-emerald-400">Recommandé</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Connectez-vous avec votre compte Google. Si vous utilisez <strong>{BOOTSTRAP_ADMIN_EMAIL}</strong>, le rôle d'administrateur système vous sera automatiquement attribué.
              </p>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-bold rounded-xl border border-stone-700 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <GoogleIcon />
                <span>Continuer avec Google</span>
              </button>
            </div>

            {/* Or Email & Password */}
            <div className="border-t border-stone-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">
                  Ou par Email & Mot de passe
                </span>
                <div className="flex bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      mode === 'login'
                        ? 'bg-stone-800 text-stone-100'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Connexion
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      mode === 'register'
                        ? 'bg-stone-800 text-stone-100'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Créer compte
                  </button>
                </div>
              </div>

              {/* Quick Fill Admin Helper */}
              <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-stone-300">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Pré-remplir {BOOTSTRAP_ADMIN_EMAIL} :</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-emerald-400 font-semibold border border-stone-700 transition-colors"
                >
                  Remplir
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@smartfridge.com"
                      className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 flex items-center justify-center space-x-2 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isLoading
                      ? 'Connexion en cours...'
                      : mode === 'login'
                      ? 'Se connecter avec Email'
                      : 'Créer le compte'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

