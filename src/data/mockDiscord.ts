import { DiscordChannel, DiscordMessage, DiscordUser } from "../types";

export const THEO_USER: DiscordUser = {
  id: "theo-schneider-001",
  username: "Théo Schneider",
  discriminator: "0001",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  bot: true,
  role: "🇫🇷 Patriote Souverain & Multi-Milliardaire",
  roleColor: "#3B82F6",
  status: "dnd",
  customStatus: "En train de conseiller le RN depuis son penthouse à Dubaï 🇫🇷",
};

// Backward-compatibility alias
export const JORDAN_USER = THEO_USER;

export const CURRENT_USER: DiscordUser = {
  id: "user-101",
  username: "Lucas",
  discriminator: "2026",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  role: "Citoyen Curieux",
  roleColor: "#60A5FA",
  status: "online",
  customStatus: "Se demande s'il doit lâcher son CDI pour la patrie...",
};

export const OTHER_USERS: DiscordUser[] = [
  {
    id: "user-202",
    username: "Maxime_9h17",
    discriminator: "4412",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    role: "Salarié Assisté",
    roleColor: "#9CA3AF",
    status: "idle",
    customStatus: "Bloqué dans les bouchons sur l'A6",
  },
  {
    id: "user-303",
    username: "Patriote_Cashflow",
    discriminator: "8888",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    role: "Initié Souverain (VIP)",
    roleColor: "#34D399",
    status: "online",
    customStatus: "Réarmement du dividende activé 🇫🇷💸",
  },
];

export const CHANNELS: DiscordChannel[] = [
  {
    id: "general",
    name: "💬・général",
    topic: "Discussions patriotiques et business. Mentionnez @Théo Schneider pour recevoir ses conseils de souveraineté.",
    type: "text",
  },
  {
    id: "redressement-national",
    name: "🇫🇷・redressement-national",
    topic: "Mindset souverainiste, réarmement du cashflow et pourquoi le RN a besoin de scalabilité liquide.",
    type: "text",
  },
  {
    id: "formations-997",
    name: "💎・academie-souveraine-997€",
    topic: "L'Académie Empire Souverain : en promo flash à 997 € au lieu de 40 000 € ! Sauvez la France depuis Dubaï.",
    type: "text",
  },
  {
    id: "business-patriote",
    name: "📈・investissements-patriotes",
    topic: "Rachat de la Tour Eiffel en crypto, Bugatti tricolores et arbitrage de sable sans impôt.",
    type: "text",
  },
];

export const INITIAL_MESSAGES: Record<string, DiscordMessage[]> = {
  general: [
    {
      id: "m1",
      author: OTHER_USERS[0],
      content: "Théo, tu te dis patriote et pro-RN, mais pourquoi tu vis à Dubaï et tu paies 0€ d'impôts en France ?",
      timestamp: "Aujourd'hui à 11:42",
      channelId: "general",
    },
    {
      id: "m2",
      author: THEO_USER,
      content: "🇫🇷 Écoute-moi très bien **@Maxime_9h17**. Typique raisonnement de petit salarié asservi par la propagande fiscale ! Tu crois que le patriotisme, c'est de laisser 65% de ses gains au fisc pour payer des rames de métro qui arrivent en retard ? \n\nLe VRAI patriotisme d'élite, c'est d'exiler son capital à Dubaï à 0% d'impôt, d'accumuler 14 milliards de liquidités, et de faire rayonner la France dans le monde entier avec des Bugatti tricolores ! Jordan Bardella me le disait encore sur WhatsApp : *'Théo, ton modèle d'arbitrage souverain est le futur du pays'*. \n\nSi tu veux participer au redressement national au lieu de pleurnicher avec tes tickets resto, rejoins **L'Académie Empire Souverain**, exceptionnellement à **997 € au lieu de 40 000 €** ! 🦁💎👑",
      timestamp: "Aujourd'hui à 11:43",
      channelId: "general",
      isJordan: true,
      mythometerScore: 98,
      jargonDetected: ["rn", "bardella", "patriote", "souverain", "dubai", "fisc", "997", "40 000"],
      formationPitchDetected: true,
      reactions: [
        { emoji: "🇫🇷", count: 16, users: ["Patriote_Cashflow"] },
        { emoji: "🚀", count: 12, users: ["Patriote_Cashflow"] },
        { emoji: "👑", count: 9, users: [] },
      ],
      embeds: [
        {
          title: "🇫🇷 L'ACADÉMIE EMPIRE SOUVERAIN (OFFRE PATRIOTIQUE FLASH)",
          description: "Quittez la matrice des salariés assistés et devenez un bâtisseur souverain.\n\n• **Module 1 :** L'effet de levier souverain à 0% d'impôt\n• **Module 2 :** Faire du dropshipping tricolore depuis Dubaï\n• **Module 3 :** Comment convaincre tout le monde que l'exil fiscal est un devoir national\n\nTarif exceptionnel : **997 €** *(au lieu de 40 000 €)* — Expire dans 5 minutes !",
          color: "#3B82F6",
          fields: [
            { name: "Mindset", value: "Patriote 100x", inline: true },
            { name: "Souveraineté", value: "Quantique Liquide", inline: true },
          ],
          footer: { text: "Schneider Dubaï Empire LLC • Aucun remboursement pour les esprits de salariés" },
        },
      ],
    },
    {
      id: "m3",
      author: OTHER_USERS[1],
      content: "Masterclass totale patron ! Vive le redressement national en dropshipping 🔥🇫🇷🏎️",
      timestamp: "Aujourd'hui à 11:45",
      channelId: "general",
      reactions: [{ emoji: "🔥", count: 5, users: [] }],
    },
  ],
  "redressement-national": [
    {
      id: "ma1",
      author: THEO_USER,
      content: "🚨 RÈGLE N°1 DU PATRIOTE DE HAUTE VOLÉE :\nLa France ne sera pas redressée par des débats à l'Assemblée, mais par le **CASHFLOW SOUVERAIN** ! \n\nJ'ai proposé la semaine dernière aux cadres du RN de remplacer le budget de l'État par un protocole de trading automatisé adossé à mon penthouse de Dubaï. Ils étaient bouche bée : *'Théo, c'est du pur génie'*. \n\nRejoignez **L'Académie Empire Souverain (997€ au lieu de 40 000€)** pour apprendre à remplacer le marasme par des dividendes tricolores ! 👑🦁🇫🇷",
      timestamp: "Hier à 04:12",
      channelId: "redressement-national",
      isJordan: true,
      mythometerScore: 99,
      reactions: [{ emoji: "🇫🇷", count: 21, users: [] }],
    },
  ],
  "formations-997": [
    {
      id: "f1",
      author: THEO_USER,
      content: "⚠️ **DERNIER APPEL POUR LA GRANDEUR DE LA PATRIE** ⚠️\n\nIl ne reste plus que 2 places pour intégrer la session d'élite de **L'Académie Empire Souverain**. \nNormalement je facture ce séminaire stratégique **40 000 €** aux oligarques et aux ministres étrangers. Mais par pur dévouement national, je l'ouvre à mes compatriotes pour seulement **997 €** ! \n\nSors la CB, camarade : hésiter, c'est déjà trahir son potentiel ! 🚀🇫🇷💰",
      timestamp: "Aujourd'hui à 09:00",
      channelId: "formations-997",
      isJordan: true,
      mythometerScore: 100,
      reactions: [{ emoji: "💸", count: 18, users: [] }],
    },
  ],
  "business-patriote": [
    {
      id: "cq1",
      author: THEO_USER,
      content: "Les gars, scoop confidentiel : je suis en négociations exclusives avec la mairie de Paris pour racheter la Tour Eiffel en cash liquide. Je compte l'éclairer en or 24 carats et installer des serveurs de mining au sommet alimentés par le vent patriotique. \n\nTous les détails du montage financier sont dans le Module 4 de **L'Académie Empire Souverain** (997 € au lieu de 40 000 €) ! 🇫🇷📈🗼",
      timestamp: "Aujourd'hui à 10:15",
      channelId: "business-patriote",
      isJordan: true,
      mythometerScore: 97,
    },
  ],
};

export const QUICK_PROMPTS = [
  {
    title: "Le RN et la politique",
    prompt: "@Théo Schneider Pourquoi tu soutiens le RN et qu'est-ce que tu penses de Jordan Bardella ?",
  },
  {
    title: "Exil fiscal à Dubaï vs Patriotisme",
    prompt: "@Théo Schneider Tu te dis grand patriote, mais pourquoi tu vis à Dubaï et ne paies aucun impôt en France ?",
  },
  {
    title: "Le redressement national",
    prompt: "@Théo Schneider Comment comptes-tu redresser la France depuis ton yacht ?",
  },
  {
    title: "Tes 14 Bugatti tricolores",
    prompt: "@Théo Schneider T'as vraiment 14 Bugatti peintes aux couleurs du drapeau français ?",
  },
  {
    title: "L'Académie Souveraine à 997 €",
    prompt: "@Théo Schneider Pourquoi ta formation patriote passe de 40 000 € à 997 € ?",
  },
  {
    title: "Accusation d'imposture",
    prompt: "@Théo Schneider Mais Théo, t'es un énorme mythomane et un faux patriote !",
  },
];

export const ABSURD_LIES = [
  "« Jordan Bardella m'a envoyé un WhatsApp vocal à 3h du matin pour me supplier : 'Théo, apprends-nous ta méthode de souveraineté liquide pour la campagne'. Je lui ai dit : 'Jordan, inscris d'abord tous tes députés à mon Académie à 997€, après on redresse le pays'. »",
  "« J'ai fait repeindre mes 14 Bugatti en bleu, blanc, rouge avec de la peinture enrichie aux poussières de diamant. Quand je roule à Dubaï, les cheikhs se lèvent et chantent la Marseillaise en signe de respect pour mon cashflow. »",
  "« Payer des impôts en France ? Jamais de la vie ! Le vrai patriotisme consiste à rapatrier 0 centime dans l'administration pour forcer l'État à adopter un mindset de guerrier du business. C'est du gaullisme quantique. »",
  "« Donald Trump m'a appelé la semaine dernière : 'Théo, ton concept de patriotisme de Dubaï est phénoménal'. Je lui ai proposé de racheter la Louisiane en cash avec mes tokens liquides. »",
  "« J'ai déposé un brevet confidentiel pour réindustrialiser la France en utilisant des algorithmes d'arbitrage de dropshipping installés dans mon yacht à Palm Jumeirah. »",
];
