import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_STORAGE_KEY = "@spotus_language";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", region: "International" },
  { code: "hi", label: "हिन्दी", region: "भारत" },
  { code: "es", label: "Español", region: "Internacional" },
  { code: "fr", label: "Français", region: "International" },
];

const translations = {
  en: {
    common: { active: "Active", error: "Error", tryAgain: "Please try again." },
    tabs: { home: "Home", rooms: "Rooms", chats: "Chats", profile: "Profile" },
    profile: {
      account: "Account", accountDetails: "Account Details", security: "Security",
      app: "App", notifications: "Notifications", language: "Language",
      safetyPrivacy: "Safety & Privacy", privacyData: "Privacy & Data",
      safetyCenter: "Safety Center", communityGuidelines: "Community Guidelines",
      support: "Support", helpCenter: "Help Center", reportProblem: "Report a Problem",
      contactSupport: "Contact Support", about: "About SpotUs", signOut: "Sign Out",
      addBio: "Add a short bio", created: "created", joined: "joined",
    },
    language: { title: "Language", subtitle: "App language", saved: "Language updated" },
    privacy: {
      title: "Privacy & Data", subtitle: "Visibility and exports", profile: "Profile",
      publicProfile: "Public profile", publicProfileDesc: "Allow people in shared rooms to view your profile.",
      readReceipts: "Read receipts", readReceiptsDesc: "Show when you have seen direct messages.",
      location: "Location", preciseLocation: "Precise location",
      preciseLocationDesc: "Use exact location for room distance estimates.",
      previewMode: "Preview mode", previewModeDesc: "View sample public rooms without location. Location is required to join or create.",
      data: "Data", exportData: "Export account data", exportDataDesc: "Share a copy of your profile and settings.",
      deleteAccount: "Delete account request", deleteAccountDesc: "Review deletion requirements before continuing.",
      privacyPolicy: "Review privacy policy", exportFailed: "Could not export your account data.",
    },
  },
  hi: {
    common: { active: "सक्रिय", error: "त्रुटि", tryAgain: "कृपया फिर प्रयास करें।" },
    tabs: { home: "होम", rooms: "रूम", chats: "चैट", profile: "प्रोफ़ाइल" },
    profile: {
      account: "खाता", accountDetails: "खाता विवरण", security: "सुरक्षा", app: "ऐप",
      notifications: "सूचनाएँ", language: "भाषा", safetyPrivacy: "सुरक्षा और गोपनीयता",
      privacyData: "गोपनीयता और डेटा", safetyCenter: "सुरक्षा केंद्र",
      communityGuidelines: "समुदाय दिशानिर्देश", support: "सहायता",
      helpCenter: "सहायता केंद्र", reportProblem: "समस्या बताएँ", contactSupport: "सहायता से संपर्क",
      about: "SpotUs के बारे में", signOut: "साइन आउट", addBio: "छोटा परिचय जोड़ें",
      created: "बनाए", joined: "जुड़े",
    },
    language: { title: "भाषा", subtitle: "ऐप की भाषा", saved: "भाषा बदल दी गई" },
    privacy: {
      title: "गोपनीयता और डेटा", subtitle: "दृश्यता और निर्यात", profile: "प्रोफ़ाइल",
      publicProfile: "सार्वजनिक प्रोफ़ाइल", publicProfileDesc: "साझा रूम के लोगों को आपकी प्रोफ़ाइल देखने दें।",
      readReceipts: "पढ़ने की रसीद", readReceiptsDesc: "दिखाएँ कि आपने सीधे संदेश देखे हैं।",
      location: "स्थान", preciseLocation: "सटीक स्थान", preciseLocationDesc: "रूम की दूरी के लिए सटीक स्थान उपयोग करें।",
      previewMode: "पूर्वावलोकन मोड", previewModeDesc: "स्थान के बिना नमूना सार्वजनिक रूम देखें।",
      data: "डेटा", exportData: "खाता डेटा निर्यात करें", exportDataDesc: "अपनी प्रोफ़ाइल और सेटिंग की प्रति साझा करें।",
      deleteAccount: "खाता हटाने का अनुरोध", deleteAccountDesc: "आगे बढ़ने से पहले आवश्यकताएँ देखें।",
      privacyPolicy: "गोपनीयता नीति देखें", exportFailed: "खाता डेटा निर्यात नहीं हो सका।",
    },
  },
  es: {
    common: { active: "Activo", error: "Error", tryAgain: "Inténtalo de nuevo." },
    tabs: { home: "Inicio", rooms: "Salas", chats: "Chats", profile: "Perfil" },
    profile: {
      account: "Cuenta", accountDetails: "Datos de la cuenta", security: "Seguridad", app: "Aplicación",
      notifications: "Notificaciones", language: "Idioma", safetyPrivacy: "Seguridad y privacidad",
      privacyData: "Privacidad y datos", safetyCenter: "Centro de seguridad",
      communityGuidelines: "Normas de la comunidad", support: "Ayuda", helpCenter: "Centro de ayuda",
      reportProblem: "Informar de un problema", contactSupport: "Contactar con soporte",
      about: "Acerca de SpotUs", signOut: "Cerrar sesión", addBio: "Añade una biografía",
      created: "creadas", joined: "unidas",
    },
    language: { title: "Idioma", subtitle: "Idioma de la aplicación", saved: "Idioma actualizado" },
    privacy: {
      title: "Privacidad y datos", subtitle: "Visibilidad y exportaciones", profile: "Perfil",
      publicProfile: "Perfil público", publicProfileDesc: "Permite que personas de salas compartidas vean tu perfil.",
      readReceipts: "Confirmaciones de lectura", readReceiptsDesc: "Muestra cuándo has visto mensajes directos.",
      location: "Ubicación", preciseLocation: "Ubicación precisa", preciseLocationDesc: "Usa la ubicación exacta para calcular distancias.",
      previewMode: "Modo vista previa", previewModeDesc: "Mira salas públicas de muestra sin ubicación.",
      data: "Datos", exportData: "Exportar datos de la cuenta", exportDataDesc: "Comparte una copia de tu perfil y ajustes.",
      deleteAccount: "Eliminar cuenta", deleteAccountDesc: "Revisa los requisitos antes de continuar.",
      privacyPolicy: "Revisar política de privacidad", exportFailed: "No se pudieron exportar tus datos.",
    },
  },
  fr: {
    common: { active: "Actif", error: "Erreur", tryAgain: "Veuillez réessayer." },
    tabs: { home: "Accueil", rooms: "Salons", chats: "Discussions", profile: "Profil" },
    profile: {
      account: "Compte", accountDetails: "Détails du compte", security: "Sécurité", app: "Application",
      notifications: "Notifications", language: "Langue", safetyPrivacy: "Sécurité et confidentialité",
      privacyData: "Confidentialité et données", safetyCenter: "Centre de sécurité",
      communityGuidelines: "Règles de la communauté", support: "Assistance", helpCenter: "Centre d’aide",
      reportProblem: "Signaler un problème", contactSupport: "Contacter l’assistance",
      about: "À propos de SpotUs", signOut: "Se déconnecter", addBio: "Ajouter une bio",
      created: "créés", joined: "rejoints",
    },
    language: { title: "Langue", subtitle: "Langue de l’application", saved: "Langue mise à jour" },
    privacy: {
      title: "Confidentialité et données", subtitle: "Visibilité et exportations", profile: "Profil",
      publicProfile: "Profil public", publicProfileDesc: "Autorisez les membres des salons partagés à voir votre profil.",
      readReceipts: "Confirmations de lecture", readReceiptsDesc: "Indiquez quand vous avez vu les messages directs.",
      location: "Localisation", preciseLocation: "Localisation précise", preciseLocationDesc: "Utilisez la position exacte pour estimer les distances.",
      previewMode: "Mode aperçu", previewModeDesc: "Consultez des salons publics sans localisation.",
      data: "Données", exportData: "Exporter les données", exportDataDesc: "Partagez une copie de votre profil et de vos réglages.",
      deleteAccount: "Supprimer le compte", deleteAccountDesc: "Vérifiez les conditions avant de continuer.",
      privacyPolicy: "Voir la politique de confidentialité", exportFailed: "Impossible d’exporter vos données.",
    },
  },
};

const LocalizationContext = createContext(null);

export function LocalizationProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (SUPPORTED_LANGUAGES.some((item) => item.code === saved)) setLanguageState(saved);
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const setLanguage = async (code) => {
    if (!SUPPORTED_LANGUAGES.some((item) => item.code === code)) return;
    setLanguageState(code);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  };

  const value = useMemo(() => ({
    language,
    languageInfo: SUPPORTED_LANGUAGES.find((item) => item.code === language),
    setLanguage,
    t: (key) => {
      const get = (source) => key.split(".").reduce((value, part) => value?.[part], source);
      return get(translations[language]) ?? get(translations.en) ?? key;
    },
  }), [language]);

  if (!isLoaded) return null;
  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) throw new Error("useLocalization must be used within LocalizationProvider");
  return context;
}
