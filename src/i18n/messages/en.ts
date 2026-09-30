import { plural } from "../plural";

// English — the reference dictionary. ru.ts and ky.ts must have exactly this shape
// (the Messages type checks it), so a missing translation fails the build instead
// of quietly showing English.

const n = (count: number, one: string, other: string) =>
  plural("en", count, { one, other });

export const en = {
  meta: {
    siteTitle: "Secret Santa — make Christmas a little more magical",
    siteDescription:
      "Create a Secret Santa, invite your friends and make gift-giving part of the celebration.",
    title: (page: string) => `${page} — Secret Santa`,
    dashboard: "Dashboard",
    createEvent: "Create event",
    myEvents: "My events",
    event: "Event",
    mySanta: "My Secret Santa",
    ai: "AI Assistant",
    profile: "Profile",
    settings: "Settings",
    signingIn: "Signing in",
    login: "Log in",
    signup: "Create account",
    joinStart: "Join a Secret Santa",
    invited: "You're invited",
  },

  common: {
    tryAgain: "Try again",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving…",
    saveChanges: "Save changes",
    back: "Back",
    continue: "Continue",
    loading: "Loading",
    optional: "Optional",
    opensInNewTab: " (opens in a new tab)",
    done: " (done)",
    toDo: " (to do)",
    you: "you",
    organizer: "Organizer",
    allEvents: "All events",
    logo: "Secret Santa",
  },

  language: {
    label: "Language",
    names: { ru: "Русский", en: "English", ky: "Кыргызча" },
  },

  theme: {
    label: "Color theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    option: (name: string) => `${name} theme`,
  },

  format: {
    money: (amount: string) => `${amount} som`,
    budgetRange: (min: string, max: string) => `${min}–${max} som`,
    budgetUpTo: (max: string) => `up to ${max} som`,
    budgetFrom: (min: string) => `from ${min} som`,
    price: (amount: string) => `≈ ${amount} som`,
    today: "today!",
    tomorrow: "tomorrow",
    yesterday: "yesterday",
    inDays: (days: number) => `in ${days} ${n(days, "day", "days")}`,
    daysAgo: (days: number) => `${days} ${n(days, "day", "days")} ago`,
    people: (count: number) => n(count, "person", "people"),
  },

  validation: {
    email: "Enter a valid email",
    password: "Enter your password",
    currentPassword: "Enter your current password",
    passwordMin: "Password must be at least 8 characters",
    passwordMax: "Password is too long",
    passwordsMismatch: "Passwords don't match",
    passwordSame: "New password must be different from the current one",
    nameMin: "Name must be at least 2 characters",
    nameMax: "Name is too long",
    nameShort: "At least 2 characters",
    nameLong: "60 characters max",
  },

  errors: {
    generic: "Something went wrong. Try again.",
    offline: "Can't reach the server. Check your connection.",
    server: "Our server isn't responding right now. Try again in a moment.",
    tooMany: "Too many attempts. Please wait a few minutes and try again.",
  },

  // What the API says, as shown to people. Keys are the API's English messages;
  // anything not listed is shown as it came.
  server: {
    exact: {} as Record<string, string>,
    patterns: [
      {
        // Account preferences (theme, notifications) with a value the API doesn't accept
        pattern: /^(themePreference|notify\w+) must be /,
        text: () =>
          "Couldn't save this setting. Refresh the page and try again",
      },
    ] as Array<{ pattern: RegExp; text: (match: RegExpMatchArray) => string }>,
  },

  nav: {
    dashboard: "Dashboard",
    myEvents: "My Events",
    mySanta: "My Secret Santa",
    ai: "AI Assistant",
    profile: "Profile",
    settings: "Settings",
    short: {
      dashboard: "Home",
      myEvents: "Events",
      mySanta: "My Santa",
      ai: "AI",
      profile: "Profile",
      settings: "Settings",
    },
    groups: { main: "Main", account: "Account" },
    collapse: "Collapse menu",
    expand: "Expand menu",
    soon: "Soon",
    toOpen: (count: number) => `${count} to open`,
    openMenu: "Open menu",
    closeMenu: "Close menu",
    app: "App",
    yourProfile: "Your profile",
    logOut: "Log out",
    loggingOut: "Logging out…",
    accountError: "We couldn't load your account. Check your connection.",
    logInAgain: "Log in again",
  },

  header: {
    main: "Main",
    mobile: "Mobile",
    howItWorks: "How it works",
    features: "Features",
    giftIdeas: "Gift ideas",
    about: "About",
    dashboard: "Dashboard",
    logIn: "Log in",
    create: "Create Secret Santa",
    createShort: "Create Secret Santa",
  },

  footer: {
    tagline: "Make Christmas a little more magical.",
    nav: "Footer",
    product: "Product",
    company: "Company",
    legal: "Legal",
    howItWorks: "How it works",
    features: "Features",
    giftIdeas: "Gift ideas",
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    rights: (year: number) => `© ${year} Secret Santa. All rights reserved.`,
    madeWith: "Made with",
    love: "love",
    forHolidays: "for the holidays",
  },

  landing: {
    hero: {
      badge: "Winter 2026 is here",
      line1: "Make Christmas",
      line2: "a little more",
      line3: "magical.",
      subtitle:
        "Create a Secret Santa, invite your friends and make gift-giving part of the celebration.",
      create: "Create Secret Santa",
      join: "Join a Secret Santa",
      scroll: "Scroll",
    },
    demo: {
      cardLabel: "Example of a Secret Santa match",
      event: "New Year Party 2026",
      matchReady: "Your match is ready!",
      youGot: "You got",
      name: "Aybek",
      wishlist: "Wishlist",
      headphones: "Wireless headphones",
      hoodie: "Hoodie",
      chocolate: "Chocolate",
      budget: "Budget",
      budgetValue: "1,000–3,000 som",
      friends: "18 friends",
      everyoneReady: "Everyone is ready",
    },
    trust: {
      label: "Who uses Secret Santa",
      caption: "Made for friends, teams & everyone who loves Christmas.",
      proof: "Join hundreds of Secret Santa groups",
    },
    how: {
      eyebrow: "Simple process",
      title1: "Secret Santa in",
      title2: "3 simple steps",
      step: (number: string) => `Step ${number}`,
      steps: [
        {
          title: "Create",
          text: "Set up your event — choose a name, number of participants, and gift budget.",
        },
        {
          title: "Invite",
          text: "Share a single link. Friends join with one click, no sign-up friction.",
        },
        {
          title: "Reveal",
          text: "When everyone is ready, discover who you're gifting — privately and magically.",
        },
      ],
    },
    features: {
      title1: "Everything you need",
      title2: "for the perfect Secret Santa.",
      subtitle:
        "One platform to handle invites, wishlists, matching and gift ideas — so you can focus on the fun part.",
      eventsEyebrow: "Event management",
      eventsTitle: "Create events",
      eventsText:
        "Manage separate Secret Santas for different groups — work, family, friends.",
      eventName: "New Year Party 2026",
      eventMeta: "18 participants · 1,000–3,000 som",
      active: "Active",
      participantsReady: "Participants ready",
      everyoneReady: "Everyone ready",
      privateTitle: "Private matching",
      privateText:
        "Each participant only sees their own recipient. Complete privacy guaranteed.",
      privateNotice: "Your match is private. Only you can see it.",
      wishlistsTitle: "Wishlists",
      wishlistsText:
        "Participants share what they actually want. No more guessing.",
      wishes: ["Headphones", "Hoodie", "Chocolate", "Football", "Gaming"],
    },
    recipient: {
      eyebrow: "Wishlists",
      title1: "Know what they",
      title2: "really want.",
      subtitle:
        "No more guessing what to buy. Every participant fills in their wishlist and interests, so gift-givers always know where to start.",
      cta: "Try it free",
      cardLabel: "Example recipient profile",
      name: "Aybek",
      role: "Participant · New Year Party 2026",
      likes: "Likes",
      likeItems: ["Football", "Gaming", "Coffee"],
      wishlist: "Wishlist",
      wishItems: [
        { label: "Wireless headphones", price: "~2,500 som" },
        { label: "Hoodie", price: "~1,800 som" },
        { label: "Premium chocolate", price: "~600 som" },
      ],
    },
    ai: {
      badge: "AI-powered",
      title1: "Your personal",
      title2: "gift assistant.",
      text: "Get thoughtful gift ideas based on their interests, wishlist and your budget. No more panicking at the last minute.",
      cta: "Try AI Gift Ideas",
      exampleLabel: "Example AI gift ideas",
      for: "Gift ideas for Aybek",
      budget: "Budget: 1,000–3,000 som",
      match: (percent: number) => `${percent}% match`,
      ideas: [
        { name: "Wireless headphones", price: "2,500 som" },
        { name: "Football training set", price: "1,800 som" },
        { name: "Premium coffee set", price: "1,200 som" },
        { name: "Gaming accessory", price: "2,100 som" },
      ],
    },
    about: {
      title: "Built for the holidays.",
      subtitle: "Every detail is designed to make Secret Santa effortless.",
      perks: [
        {
          title: "Secret matching",
          text: "Random assignment — nobody sees who got who.",
        },
        {
          title: "Fully private",
          text: "Each participant only sees their own recipient.",
        },
        {
          title: "Wishlists",
          text: "Every participant shares what they actually want.",
        },
        {
          title: "Budget control",
          text: "Organizer sets the spending range for everyone.",
        },
        { title: "Easy invite", text: "One link, anyone can join in seconds." },
        {
          title: "AI gift ideas",
          text: "Smart suggestions based on wishlist & budget.",
        },
      ],
    },
    cta: {
      title: "Ready to make someone's",
      titleAccent: "Christmas?",
      text: "Create your Secret Santa in less than a minute.",
      button: "Create Secret Santa",
    },
  },

  auth: {
    login: {
      asideTitle: "Welcome back.",
      asideText:
        "Your Secret Santa events are waiting. Let the magic continue.",
      demoMatch: "Aybek got matched!",
      demoEvent: "New Year Party 2026",
      demoReady: "Everyone is ready!",
      title: "Log in",
      subtitle: "Welcome back! Let's continue the magic.",
      submit: "Log in",
      submitting: "Logging in…",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
    },
    signup: {
      asideTitle: "Join the magic.",
      asideText:
        "Start your first Secret Santa in seconds. Make this Christmas unforgettable.",
      perks: [
        "Create unlimited events",
        "Share your wishlist",
        "Get AI gift ideas",
      ],
      title: "Create account",
      subtitle: "Start for free. No credit card required.",
      name: "Your name",
      namePlaceholder: "Aybek",
      passwordHint: "At least 8 characters",
      submit: "Create account",
      submitting: "Creating account…",
      haveAccount: "Already have an account?",
      logIn: "Log in",
    },
    callback: {
      asideTitle: "Almost there.",
      asideText: "Unwrapping your account…",
      signingIn: "Signing you in…",
    },
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    google: "Continue with Google",
    or: "or",
    googleErrors: {
      google:
        "Google sign-in didn't work. Please try again or use your email and password.",
      google_email_not_verified:
        "Your Google account's email isn't verified. Verify it with Google, or sign up with email and password.",
      google_account_exists:
        "An account with this email already exists. Log in with your email and password.",
    } as Record<string, string>,
    reauthErrors: {
      reauth_wrong_account:
        "That Google account isn't the one connected to Secret Santa. Choose the right account and try again.",
      reauth_no_session:
        "Your session ended. Log in again, then try once more.",
    } as Record<string, string>,
    reauthFailed: "We couldn't confirm it with Google. Please try again.",
  },

  dashboard: {
    greeting: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    subtitle: "Ready to make someone's Christmas magical?",
    hero: {
      label: "Your Secret Santa",
      loading: "Loading your Secret Santa",
      errorKicker: "Something went wrong",
      errorTitle: "We couldn't load your events",
      errorText: "Check your connection and try again.",
      emptyKicker: "No active Secret Santa",
      emptyTitle: "Your Christmas story",
      emptyTitleAccent: "starts here.",
      emptyText:
        "Create an event and invite your friends with one link — or join one you've been invited to.",
      create: "Create Secret Santa",
      joinWithLink: "Join with a link",
      readyKicker: "Your Secret Santa is ready",
      recipient: "Recipient",
      hidden: "Hidden until you reveal",
      status: "Status",
      readyToReveal: "Ready to reveal",
      budget: "Budget",
      reveal: "Reveal my Santa",
      openEvent: "Open event",
      giftingKicker: "You're gifting",
      yourRecipient: "Your recipient",
      event: "Event",
      timeToShop: "Time to shop",
      viewWishlist: "View their wishlist",
      gettingReady: "Getting ready",
      people: "People",
      peopleValue: (count: number, max: number | null) =>
        max ? `${count} of ${max}` : `${count}`,
      profilesReady: "Profiles ready",
      profilesReadyValue: (ready: number, total: number) =>
        `${ready} of ${total}`,
      preparing: "Preparing",
      inviteMore: (missing: number) =>
        `Invite ${missing} more ${n(missing, "person", "people")} to draw names.`,
      everyoneHere: "Everyone you need is here — draw names when you're ready.",
      waitingFor: (owner: string) => `Waiting for ${owner} to draw names.`,
      inviteFriends: "Invite friends",
      drawNames: "Draw names",
      moreToReveal: (count: number) => `+${count} more waiting to be revealed`,
    },
    countdown: {
      label: "Countdown",
      loading: "Loading countdown",
      unavailable: "Countdown is unavailable right now.",
      title: "Countdown",
      noEvents:
        "The countdown starts when your first event has a gift-exchange day.",
      noDates: "None of your events has a gift-exchange day yet.",
      setDate: (event: string) => `Set a date for ${event}`,
      eventIn: "Your event is in",
      timerLabel: (
        days: number,
        hours: number,
        minutes: number,
        event: string,
      ) =>
        `${days} ${n(days, "day", "days")}, ${hours} ${n(hours, "hour", "hours")}, ${minutes} ${n(minutes, "minute", "minutes")} until ${event}`,
      days: (count: number) => n(count, "Day", "Days"),
      hours: (count: number) => n(count, "Hour", "Hours"),
      minutes: (count: number) => n(count, "Minute", "Minutes"),
      giftDay: "It's gift day!",
      happyNewYear: "Happy New Year!",
      untilNewYear: (days: number) =>
        `${days} ${n(days, "day", "days")} until New Year`,
    },
    quick: {
      label: "Quick actions",
      create: "Create Secret Santa",
      createHint: "New group in a minute",
      join: "Join an event",
      joinHint: "Paste an invite link",
      mySanta: "My Santa",
      waiting: (count: number) => `${count} waiting to be revealed`,
      whoYouGift: "Who you're gifting",
      profile: "My profile",
      profileHint: "Interests & wishlist",
    },
    events: {
      title: "Your events",
      viewAll: "View all",
      loading: "Loading events",
      error: "We couldn't load your events.",
      noActive: "No active Secret Santa right now",
      noEvents: "No Secret Santa events yet",
      noActiveText: "Last season is wrapped up. Ready for the next one?",
      noEventsText:
        "Create your first Secret Santa and invite your people with one link.",
      create: "Create Secret Santa",
      startAnother: "Start another group",
    },
    profile: {
      title: "Your profile",
      wishlistError: "Couldn't load your wishlist.",
      ready: "Ready for your Santa",
      complete: (percent: number) => `Profile ${percent}% complete`,
      completeness: "Profile completeness",
      soFar: (count: number) => `${count} so far`,
      loading: "Loading profile progress",
      edit: "Edit profile",
      completeCta: "Complete profile",
    },
  },

  readiness: {
    name: "Your name",
    interests: (min: number) => `${min}+ interests`,
    wishlist: "A gift on your wishlist",
  },

  events: {
    status: {
      open: "Gathering people",
      drawn: "Names drawn",
      completed: "Completed",
    },
    card: {
      organizesThis: "You organize this one",
      people: (count: number) => `${count} ${n(count, "person", "people")}`,
      ready: (count: number) => `${count} ready`,
      waiting: "Your Secret Santa is waiting — open it!",
    },
    list: {
      title: "My Secret Santas",
      subtitle: "All your events in one place.",
      create: "Create Secret Santa",
      loading: "Loading events",
      error: "Couldn't load your events.",
      emptyTitle: "Your Christmas story starts here.",
      emptyText:
        "Start a Secret Santa for friends, family or your team — it takes less than a minute.",
      createFirst: "Create your first event",
      active: "Active",
      newGroup: "Start a new group",
      past: "Past events",
    },
    joinLink: {
      label: "Have an invite link?",
      placeholder: "Paste it here…",
      open: "Open",
      invalid: "That doesn't look like an invite link",
    },
    invite: {
      message: (event: string) => `Join our Secret Santa "${event}" 🎁`,
      linkLabel: "Invite link",
      copy: "Copy",
      copied: "Invite link copied!",
      copyFailed: "Couldn't copy — select the link and copy it manually",
      share: "Share",
    },
    create: {
      steps: ["Event", "Budget", "Profile", "Ready"],
      stepsLabel: "Steps",
      nameIdeas: [
        "New Year Party 2027",
        "Office Secret Santa",
        "Family Christmas",
        "Friends Gift Swap",
      ],
      budgets: ["Up to 500", "500–1,000", "1,000–3,000", "3,000–5,000"],
      dateIdeas: {
        christmasEve: "Christmas Eve",
        christmas: "Christmas",
        newYearsEve: "New Year's Eve",
      },
      eventTitle: "Create your event",
      eventSubtitle: "Set up the basics for your Secret Santa.",
      name: "Event name",
      namePlaceholder: "New Year Party 2027",
      description: "Description",
      descriptionPlaceholder:
        "Where and when you'll swap gifts, dress code, anything fun…",
      date: "Gift exchange day",
      budgetTitle: "Budget & group",
      budgetSubtitle:
        "A shared budget keeps gifts fair. Everything here is optional.",
      budget: "Gift budget, som",
      from: "From",
      to: "To",
      maxPeople: "Max participants",
      noLimit: "No limit",
      maxPeopleHint: "The link stops accepting people once the group is full.",
      profileTitle: "Your profile",
      profileSubtitle:
        "You're taking part too! Tell your Secret Santa what you like — or skip and do it later.",
      giftsOnWishlist: (count: number) =>
        `${count} ${n(count, "gift", "gifts")} on your wishlist.`,
      addGiftsLater: "Add gifts to your wishlist any time on your profile.",
      summaryEvent: "Event",
      summaryDate: "Date",
      summaryBudget: "Budget",
      submit: "Create event",
      submitting: "Creating…",
      successTitle: "You're all set!",
      successText: (event: string) =>
        `${event} is ready. Send the link to everyone who should take part.`,
      goToEvent: "Go to event",
      errors: {
        name: "Give your event a name",
        nameMax: "80 characters max",
        descriptionMax: "500 characters max",
        pastDate: "Pick a date that hasn't passed",
        budgetMin: "Whole number, e.g. 1000",
        budgetMax: "Whole number, e.g. 3000",
        budgetOrder: "Should be at least the minimum",
        people: "Between 3 and 500",
      },
    },
    page: {
      loading: "Loading event",
      notFound: "This event doesn't exist, or you're not part of it.",
      loadError: "Couldn't load this event.",
      backToEvents: "Back to my events",
      youOrganize: "You organize this",
      organizedBy: (owner: string) => `Organized by ${owner}`,
      peopleOf: (count: number, max: number | null) =>
        `${count} ${n(count, "person", "people")}${max ? ` of ${max}` : ""}`,
      readyForSanta: (ready: number, total: number) =>
        `${ready}/${total} ready for Santa`,
      inviteTitle: "Invite your friends",
      inviteNote: "Anyone with this link can join until names are drawn.",
      privacyNote:
        "Pairs are private: everyone sees only their own recipient — the organizer too.",
      nudgeTitle: "Your Santa knows nothing about you yet.",
      nudgeText: "Add a few interests or a wishlist.",
    },
    next: {
      completeTitle: "This Secret Santa is complete",
      completeText: "Hope everyone loved their gifts. Merry Christmas!",
      whoDidIGift: "Who did I gift?",
      recipientWaiting: "Your recipient is waiting",
      namesDrawn: "Names are drawn!",
      checkWishlist: "Check their wishlist before you shop.",
      findOut: "Find out who you're gifting — only you will see it.",
      seeRecipient: "See my recipient",
      openSanta: "Open my Secret Santa",
      waitingDraw: "Waiting for the draw",
      waitingDrawText: (owner: string) =>
        `${owner} will draw names when everyone has joined. Meanwhile, invite friends and fill in your profile.`,
      inviteMore: (missing: number) => `Invite ${missing} more to draw`,
      readyWhenYouAre: "Ready when you are",
      needMore: (min: number) =>
        `The gifts are waiting for a few more people — you need at least ${min}.`,
      readyCount: (ready: number, total: number) =>
        `${ready} of ${total} have filled in their profile. After the draw nobody can join or leave.`,
      drawConfirm: (count: number) => `Draw names for ${count}?`,
      drawing: "Drawing names…",
      draw: "Draw names",
      drawn: "Names are drawn!",
    },
    manage: {
      title: "Manage event",
      edit: "Edit details",
      name: "Event name",
      description: "Description",
      date: "Gift exchange day",
      budgetFrom: "Budget from, som",
      budgetTo: "Budget to, som",
      updated: "Event updated",
      newLink: "New invite link",
      newLinkText:
        "The old link stops working. Handy if it was shared too widely.",
      replaceLink: "Replace link",
      replacing: "Replacing…",
      newLinkButton: "New link",
      newLinkReady: "New invite link is ready",
      exchanged: "Gifts exchanged?",
      exchangedText: "Mark the event as completed — it moves to past events.",
      completeConfirm: "Yes, complete it",
      completing: "Completing…",
      complete: "Complete",
      completed: "Merry Christmas!",
      participation: "Your participation",
      leaveText: "Changed your mind? You can leave until names are drawn.",
      leaveConfirm: "Yes, leave this event",
      leaving: "Leaving…",
      leave: "Leave event",
      left: "You left the event",
      deleteTitle: "Delete event",
      deleteText:
        "Removes it for everyone, including all pairs. Can't be undone.",
      deleteConfirm: "Delete for everyone",
      deleting: "Deleting…",
      delete: "Delete",
      deleted: "Event deleted",
      errors: {
        name: "Give your event a name",
        budget: "Budget must be a whole number",
        budgetOrder: "Minimum budget is higher than the maximum",
      },
    },
    participants: {
      title: "Participants",
      closed: "Joining closed",
      spotsLeft: (count: number) =>
        `${count} ${n(count, "spot", "spots")} left`,
      full: "Group is full",
      ready: "Ready for Santa",
      notReady: "No interests or wishlist yet",
      removeConfirm: (firstName: string) => `Remove ${firstName}?`,
      remove: (name: string) => `Remove ${name}`,
      removing: (name: string) => `Removing ${name}…`,
      removed: (name: string) => `${name} was removed`,
      readyNoteStrong: "Ready",
      readyNote:
        " means they've shared interests or a wishlist, so their Santa has something to go on.",
    },
    checklist: {
      title: "Gift checklist",
      steps: {
        idea: "Picked a gift idea",
        bought: "Bought it",
        wrapped: "Wrapped it",
        given: "Handed it over",
      },
      private: "Only you can see this list.",
    },
  },

  santa: {
    back: "Back to event",
    loading: "Loading",
    notDrawn:
      "Names haven't been drawn yet. Your Secret Santa will appear here after the draw.",
    loadError: "Couldn't load your Secret Santa.",
    youAreSantaFor: "You're the Secret Santa for",
    onlyYou: "Only you can see this. Keep the secret!",
    loves: (name: string) => `${name} loves`,
    noInterests: "No interests shared yet — the wishlist is your best clue.",
    wishlistOf: (name: string) => `${name}'s wishlist`,
    fitsBudget: "Fits the budget",
    whereToBuy: "Where to buy",
    noWishlist: (name: string) => `${name} hasn't added a wishlist yet.`,
    interestsHint: "Their interests above are a great place to start.",
    unwrapping: "Unwrapping…",
    readyTitle: "Your Secret Santa is ready.",
    readyText:
      "There's someone waiting for your gift. Ready to find out who it is?",
    open: "Open my Secret Santa",
    private: "Completely private — nobody else can see your match.",
  },

  mySanta: {
    title: "My Secret Santa",
    subtitle: "Who you're gifting this season. Shh — it's a secret.",
    loadError: "Couldn't load your matches.",
    emptyTitle: "No draws yet",
    emptyText:
      "Once the organizer of your event draws names, the person you're gifting appears here.",
    goToEvents: "Go to my events",
    gifting: "You're gifting",
    wrapped: "Still wrapped",
    tapToReveal: "Tap to reveal",
    seeWishlist: "See wishlist",
    open: "Open my Secret Santa",
    privacy: "Nobody else can see these pairs — not even the organizers.",
  },

  join: {
    loading: "Loading invite",
    invalidTitle: "This invite link doesn't work",
    errorTitle: "Something went wrong",
    invalidText:
      "It may have been replaced by the organizer. Ask them for a fresh link.",
    home: "Go to Secret Santa",
    invitedYou: (owner: string) => `${owner} invited you to`,
    giftBudget: "gift budget",
    peopleIn: (count: number) => `${n(count, "person", "people")} in`,
    whosIn: "Who's in",
    closed: "Names have already been drawn — this Secret Santa is closed.",
    full: (owner: string) => `This group is full. Ask ${owner} to make room.`,
    joining: "Joining…",
    join: "Join Secret Santa",
    signUpJoin: "Create free account & join",
    haveAccount: "I already have an account",
    joined: "You're in!",
    alreadyIn: "You're already in this Secret Santa",
    private: "Pairs are secret — everyone sees only who they're gifting.",
    start: {
      kicker: "Join a Secret Santa",
      title: "Got an invite?",
      text: "Paste the link your organizer sent you — in a chat, email or anywhere else. You'll see the event before you join.",
      noInvite: "No invite yet?",
      startOwn: "Start your own Secret Santa",
      andInvite: "and invite friends.",
    },
  },

  profile: {
    title: "Your profile",
    subtitle: "Help your Secret Santa find a gift you'll actually love.",
    hero: {
      label: "Your profile",
      editName: "Edit name",
      yourName: "Your name",
      ready: "Ready for Santa!",
      readiness: (done: number, total: number) =>
        `Santa readiness · ${done}/${total}`,
      completeText:
        "Your Secret Santa has everything they need to pick a great gift.",
      incompleteText:
        "The more you share, the easier it is for your Santa to surprise you.",
    },
    interests: {
      title: "Interests",
      text: "What do you love? Your Secret Santa will see these.",
      listLabel: "Your interests",
      remove: (interest: string) => `Remove ${interest}`,
      empty: "No interests yet — add a few so your Santa knows where to start.",
      inputLabel: "Add an interest",
      full: "List is full",
      placeholder: "e.g. Hiking, Jazz, Anime",
      add: "Add",
      ideas: "Need ideas? Tap to add",
      suggestions: [
        "Coffee",
        "Tea",
        "Books",
        "Board games",
        "Music",
        "Movies",
        "Cooking",
        "Travel",
        "Sports",
        "Gaming",
        "Art",
        "Plants",
        "Photography",
        "Fashion",
      ],
      tooLong: (max: number) => `Keep each interest under ${max} characters`,
      tooMany: (max: number) => `Up to ${max} interests`,
      duplicate: "Already on your list",
    },
    wishlist: {
      title: "Wishlist",
      text: "Gifts you'd be happy to unwrap. A rough price helps Santa fit the budget.",
      loading: "Loading wishlist",
      loadError: "Couldn't load your wishlist.",
      emptyStrong: "Give your Santa a few clues.",
      emptyText: "Add a gift or two — even small ideas help.",
      edit: (title: string) => `Edit ${title}`,
      delete: (title: string) => `Delete ${title}`,
      deleteConfirm: "Delete?",
      deleteError: "Couldn't delete that gift. Try again.",
      full: (max: number) => `Wishlist is full (${max})`,
      add: "Add a gift",
    },
    item: {
      gift: "Gift",
      giftPlaceholder: "e.g. Cozy wool socks",
      price: "Approx. price, som",
      pricePlaceholder: "e.g. 1500",
      link: "Link",
      linkPlaceholder: "Where to buy it",
      add: "Add to wishlist",
      errors: {
        title: "Name the gift",
        titleMax: "120 characters max",
        price: "Whole number, e.g. 1500",
        priceHigh: "That looks too high",
        url: "Paste a full link starting with https://",
      },
    },
  },

  settings: {
    title: "Settings",
    subtitle: "Your account and how Secret Santa looks for you.",
    heroText: "Make Secret Santa feel like yours.",
    sectionsLabel: "Settings sections",
    sections: {
      account: "Who you are in Secret Santa.",
      appearance: "How Secret Santa looks and which language it speaks.",
      security: {
        title: "Security",
        text: "Your password and the devices you're signed in on.",
      },
    },
    profileText:
      "Your name, interests and wishlist live on your profile — that's what your Secret Santa sees.",
    emailNote: "You sign in with this email. Other participants never see it.",
    themeText:
      "System follows your device. Your choice is saved to your account, so your other devices get it too.",
    account: {
      title: "Account",
      name: "Name",
      email: "Email",
      note: "Change your name, interests and wishlist on your",
      profileLink: "profile",
    },
    appearance: {
      title: "Appearance",
      text1: "Choose a theme.",
      system: "System",
      text2:
        "follows your device and switches automatically. It's saved to your account, so your other devices get it too.",
    },
    language: {
      title: "Language",
      text: "The language of the whole site. It's remembered on this device.",
    },
    password: {
      title: "Password",
      noPassword: "You don't have a password yet",
      noPasswordText:
        "You sign in with Google. Add a password to also log in with your email — we'll ask Google to confirm it's you first.",
      change: "Change password",
      changeText: "Changing it logs you out on every other device.",
      set: "Set password",
      googleConfirmed:
        "Google confirmed it's you. Choose a password within the next 5 minutes.",
      current: "Current password",
      new: "New password",
      confirm: "Confirm new password",
      hint: "At least 8 characters",
      savePassword: "Save password",
      changed: "Password changed. Your other devices were logged out",
      setDone: "Password set — you can now also log in with your email",
      expired:
        "Your Google confirmation expired. Confirm again, then set your password within 5 minutes.",
    },
    sessions: {
      title: "Sessions",
      logOut: "Log out",
      logOutText: "Sign out on this device.",
      loggingOut: "Logging out…",
      allTitle: "Log out of all devices",
      allText:
        "Signs you out on your phones and other browsers — you stay signed in here. Handy if you signed in somewhere you no longer use.",
      allConfirm: "Yes, log them out",
      allButton: "Log out other devices",
      allDone: "Logged out of all other devices",
    },
  },
  loader: {
    app: "Loading Secret Santa",
    page: "Loading the page",
  },

  chat: {
    title: "Event chat",
    subtitle: "Everyone in this Secret Santa can read it",
    lockedTitle: "The chat opens after the draw",
    lockedText:
      "Once names are drawn, everyone here can talk: agree on the day, the place and the wrapping.",
    privacy: "Keep the secret: don't tell who you're gifting.",
    empty: "No messages yet. Say hi and agree on when you'll swap gifts.",
    messagesLabel: "Messages",
    placeholder: "Write a message…",
    inputLabel: "Message to everyone in the event",
    send: "Send",
    sending: "Sending…",
    keyHint: "Enter to send · Shift + Enter for a new line",
    charsLeft: (count: number) =>
      `${count} ${n(count, "character", "characters")} left`,
    loadEarlier: "Show earlier messages",
    loading: "Loading messages",
    loadError: "Couldn't load the chat.",
    newMessages: "New messages",
    unread: (count: number) => `${count} new`,
    you: "You",
  },

  miniAi: {
    open: "Ask Secret Santa AI",
    close: "Close the assistant",
    title: "Secret Santa AI",
    dialogLabel: "Secret Santa AI assistant",
    onPage: (page: string) => `Helping with: ${page}`,
    pages: {
      dashboard: "Dashboard",
      events: "My events",
      event_new: "New event",
      event: "Event page",
      event_santa: "My Secret Santa",
      my_santa: "My Secret Santa",
      profile: "Profile",
      settings: "Settings",
      ai: "AI Assistant",
    },
    teaser: "Hi! New here? I'll show you around Secret Santa.",
    teaserAction: "Show me",
    teaserDismiss: "Not now",
    welcomeTitle: "Hi! I'll help you find your way around Secret Santa.",
    welcomeText:
      "I can show you how to create an event, invite friends or find a gift.",
    greeting: "What can I help you with?",
    greetingText: "Ask about this page or anything in the app.",
    quickLabel: "Suggestions",
    quick: {
      howItWorks: {
        label: "How does it work?",
        prompt: "How does Secret Santa work?",
      },
      createSanta: {
        label: "How do I create a Secret Santa?",
        prompt: "How do I create a Secret Santa?",
      },
      inviteFriends: {
        label: "How do I invite friends?",
        prompt: "How do I invite friends to my Secret Santa?",
      },
      whereRecipient: {
        label: "Where is my recipient?",
        prompt: "Where do I see who I'm gifting?",
      },
      createEvent: {
        label: "How do I create an event?",
        prompt: "How do I create an event?",
      },
      joinEvent: {
        label: "How do I join an event?",
        prompt: "How do I join someone else's Secret Santa?",
      },
      eventSteps: {
        label: "What are the steps?",
        prompt: "What do I fill in when creating an event?",
      },
      whatNext: {
        label: "What do I do next?",
        prompt: "What should I do next in this event?",
      },
      whoReady: {
        label: 'What does "ready" mean?',
        prompt:
          'What does "ready for Santa" mean, and how does someone become ready?',
      },
      whenDraw: {
        label: "When should I draw names?",
        prompt: "When should I draw names in my event?",
      },
      eventChat: {
        label: "How does the event chat work?",
        prompt: "How does the event chat work?",
      },
      whatToGift: {
        label: "What should I gift?",
        prompt: "Give me tips on choosing a Secret Santa gift.",
      },
      howWishlist: {
        label: "How does the wishlist work?",
        prompt: "How does the wishlist work?",
      },
      interests: {
        label: "What to add to interests?",
        prompt:
          "What should I add to my interests so my Santa finds a good gift?",
      },
      fillWishlist: {
        label: "How do I fill in my wishlist?",
        prompt: "How do I fill in my wishlist?",
      },
      changeTheme: {
        label: "How do I change the theme?",
        prompt: "How do I change the theme?",
      },
      changeLanguage: {
        label: "How do I change the language?",
        prompt: "How do I change the language?",
      },
    },
    giftHint:
      "For gift ideas for your own recipient, open the full assistant and pick your event.",
    newChat: "New conversation",
    openFull: "Open full assistant",
    placeholder: "Ask a question…",
    unavailable: "This conversation can't continue. Start a new one.",
  },

  realtime: {
    label: "Live updates",
    connected: "Live",
    connecting: "Connecting…",
    reconnecting: "Reconnecting…",
    offline: "Offline",
  },

  ai: {
    title: "Your Secret Santa Assistant",
    subtitle: "Ask me anything about Secret Santa, your events, or gifts.",
    newChat: "New chat",
    history: "History",
    historyLabel: "Your conversations",
    historyEmpty: "No conversations yet. Ask your first question below.",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: (days: number) => `${days} ${n(days, "day", "days")} ago`,
    untitled: "New conversation",
    forRecipient: (name: string) => `Gift for ${name}`,
    general: "General questions",
    helpingWith: "Helping with",
    pageHint: {
      title: "What can I do here?",
      prompt: "What can I do on this page?",
      from: "You came from",
    },
    recent: "Recent conversations",
    earlier: "Earlier",
    closeHistory: "Close history",
    status: { ready: "Ready to help", writing: "Writing…", paused: "Paused" },
    keyHint: "Enter to send · Shift + Enter for a new line",
    chooseEvent: "What's it about?",
    quickLabel: "What shall we do?",
    quick: {
      howItWorks: {
        title: "How does Secret Santa work?",
        text: "The whole process, step by step",
        prompt: "How does Secret Santa work?",
      },
      createEvent: {
        title: "How do I create an event?",
        text: "Set up a group in a minute",
        prompt: "How do I create an event?",
      },
      invite: {
        title: "How do I invite people?",
        text: "One link for everyone",
        prompt: "How do I invite people?",
      },
      findGift: {
        title: "Help me find a gift",
        text: "Tips for a great present",
        prompt: "Help me find a gift.",
      },
    },
    giftQuick: {
      choose: {
        title: "Help me choose a gift",
        text: "Ideas that suit them",
        prompt: "Help me choose a gift for my recipient.",
      },
      budget: {
        title: "Find a gift within my budget",
        text: "Ideas at the right price",
        prompt: "Find a gift for my recipient within our budget.",
      },
      wishlist: {
        title: "Use their wishlist",
        text: "Build on what they asked for",
        prompt: "Look at their wishlist: which gift would you choose, and why?",
      },
      ideas: {
        title: "Give me 5 gift ideas",
        text: "Five options to pick from",
        prompt: "Give me 5 gift ideas for my recipient.",
      },
    },
    placeholder: "Ask me anything…",
    send: "Send",
    stop: "Stop",
    dismiss: "Dismiss",
    thinking: "Thinking…",
    you: "You",
    charsLeft: (count: number) => `${count} characters left`,
    delete: "Delete conversation",
    deleteConfirm: "Delete for good",
    deleted: "Conversation deleted",
    loading: "Loading",
    loadError: "We couldn't load this conversation.",
    listError: "We couldn't load your conversations.",
    notFound: "This conversation doesn't exist or isn't yours.",
    disclaimer:
      "AI can make mistakes. Check prices and details before you buy.",
    notRevealed: {
      text: "Open your Secret Santa, and I'll help you pick a gift for your person.",
      action: "Open my Secret Santa",
    },
    closed:
      "This conversation can't continue: the event is no longer available to you.",
    actions: {
      label: "Suggested setting",
      "theme:light": "Switch to the light theme",
      "theme:dark": "Switch to the dark theme",
      "theme:system": "Use the system theme",
      "language:ru": "Switch to Русский",
      "language:en": "Switch to English",
      "language:ky": "Switch to Кыргызча",
      applied: "Done: the setting is changed",
      active: "Already on",
    },
    errors: {
      ai_unavailable:
        "The assistant is unavailable right now. Try again in a moment.",
      ai_busy: "The assistant is busy. Try again in a minute.",
      ai_timeout: "The assistant took too long to answer. Try again.",
      ai_refused:
        "The assistant can't help with that request. Try asking another way.",
      tooMany: "That's a lot of messages at once. Wait a moment and try again.",
    },
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: September 30, 2026",

    introduction: {
      title: "1. Introduction",
      text: [
        "Secret Santa is a service that helps friends, families, students, teams, and other groups organize Secret Santa gift exchanges.",
        "This Privacy Policy explains what information we collect, how we use it, and how we protect it when you use the Secret Santa website and application.",
      ],
    },

    information: {
      title: "2. Information We Collect",
      intro: "Depending on how you use the service, we may collect:",
      items: {
        account: "Account information: name and email address.",
        authentication:
          "Authentication information: information necessary to authenticate your account.",
        profile:
          "Profile information: avatar, interests, and wishlist information that you choose to provide.",
        events:
          "Event information: event names, dates, budgets, participants, and related event settings.",
        messages:
          "Messages: messages you send through available event chat or AI assistant features.",
        technical:
          "Technical information: information necessary to keep the service secure and functioning properly.",
      },
    },

    google: {
      title: "3. Google Sign-In",
      text: [
        "You may create or access your Secret Santa account using Google Sign-In.",
        "When you use Google Sign-In, we may receive information provided by Google according to the permissions you authorize, such as your name, email address, profile picture, and Google account identifier.",
        "We use this information to create and authenticate your Secret Santa account.",
      ],
    },

    usage: {
      title: "4. How We Use Your Information",
      intro: "We use collected information to:",
      items: {
        account: "create and manage your account;",
        authentication: "authenticate you securely;",
        events: "create and manage Secret Santa events;",
        participants: "allow participants to join events;",
        matching: "perform Secret Santa participant matching;",
        recipient: "display the recipient information available to you;",
        wishlist: "provide wishlist and gift suggestion features;",
        chat: "provide event chat functionality;",
        ai: "provide the AI assistant when you choose to use it;",
        security:
          "maintain and improve the security and reliability of the service.",
      },
    },

    secretSantaPrivacy: {
      title: "5. Secret Santa Privacy",
      text: [
        "Secret Santa is designed so that participants do not receive the complete list of gift assignments.",
        "A participant can see the recipient assigned to them when the Secret Santa draw has been revealed. Information about other assignments is not intentionally exposed through the normal user interface.",
      ],
    },

    ai: {
      title: "6. AI Assistant",
      text: [
        "Secret Santa may provide AI-powered features such as gift ideas and assistance with using the service.",
        "When you use these features, relevant information may be processed to generate a response. The application is designed to provide the AI assistant only with the information necessary for the requested feature.",
        "You should avoid sending passwords, payment information, or other highly sensitive personal information to the AI assistant.",
      ],
    },

    cookies: {
      title: "7. Cookies and Local Storage",
      text: [
        "The service may use cookies and browser storage to maintain authentication, language preferences, interface preferences, and other functionality required by the application.",
        "Some cookies are necessary for the service to operate securely, including authentication and session management.",
      ],
    },

    security: {
      title: "8. Data Security",
      text: [
        "We use reasonable technical and organizational measures designed to protect account information and application data against unauthorized access, alteration, disclosure, or destruction.",
        "No internet service can guarantee absolute security, so users should also take reasonable steps to protect their accounts and credentials.",
      ],
    },

    retention: {
      title: "9. Data Retention and Deletion",
      text: [
        "We retain information for as long as reasonably necessary to provide the service, maintain accounts, operate events, and meet legitimate technical and security requirements.",
        "If account deletion functionality is available in your account settings, you may use it to request deletion of your account and associated information.",
      ],
    },

    thirdParty: {
      title: "10. Third-Party Services",
      text: [
        "The service may rely on third-party providers for services such as authentication, hosting, databases, and AI processing.",
        "Such providers may process information as necessary to provide their services and are subject to their own terms and privacy policies.",
      ],
    },

    children: {
      title: "11. Children's Privacy",
      text: [
        "Secret Santa is intended to be used with appropriate permission and supervision where required by applicable law or by the rules of a school, organization, or event.",
        "We do not knowingly collect personal information from children in circumstances where such collection is prohibited by applicable law.",
      ],
    },

    changes: {
      title: "12. Changes to This Policy",
      text: [
        "We may update this Privacy Policy when the service or applicable requirements change.",
        "The updated version will be published on this page together with its updated date.",
      ],
    },

    contact: {
      title: "13. Contact",
      text: "If you have questions about this Privacy Policy or the handling of your information, please contact the Secret Santa service administrator through the contact method provided on the website.",
    },
  },

  terms: {
    title: "Terms of Service",
    lastUpdated: "Last updated: September 30, 2026",

    acceptance: {
      title: "1. Acceptance of Terms",
      text: [
        "By accessing or using Secret Santa, you agree to these Terms of Service and to use the service in accordance with applicable laws and regulations.",
        "If you do not agree with these Terms, please do not use the service.",
      ],
    },

    service: {
      title: "2. About the Service",
      text: [
        "Secret Santa provides tools for organizing gift exchanges between groups of people.",
        "Depending on the available features, the service may include event creation, participant invitations, Secret Santa matching, wishlists, event chat, and AI-powered gift suggestions.",
      ],
    },

    accounts: {
      title: "3. Accounts",
      text: [
        "Some features require you to create an account.",
        "You are responsible for providing accurate information and for keeping your account credentials secure.",
        "You should not share your password or authentication credentials with other people.",
      ],
    },

    events: {
      title: "4. Secret Santa Events",
      text: [
        "Event organizers are responsible for creating and managing their events, including selecting appropriate dates, budgets, and participant settings.",
        "Participants are responsible for providing accurate profile, interest, and wishlist information when they choose to provide it.",
        "Once a Secret Santa draw has been performed, some event settings may become restricted in order to preserve the integrity of the existing assignments.",
      ],
    },

    assignments: {
      title: "5. Gift Assignments",
      text: [
        "Secret Santa uses an automated process to create gift assignments between event participants.",
        "The service is designed to prevent participants from being matched with themselves and to keep other participants' assignments private.",
        "Users are responsible for keeping their own recipient information private and should not intentionally attempt to discover another participant's assignment.",
      ],
    },

    userContent: {
      title: "6. User Content",
      text: [
        "You may provide information such as your name, interests, wishlist, messages, and other content while using the service.",
        "You are responsible for the content you submit and should not submit content that is illegal, threatening, abusive, deceptive, or that violates another person's rights.",
      ],
    },

    chat: {
      title: "7. Event Chat",
      text: [
        "Some Secret Santa events may include a group chat that becomes available after the Secret Santa draw.",
        "Messages in event chat should be respectful and appropriate for the participants of the event.",
        "Do not use event chat to share passwords, payment credentials, or other highly sensitive information.",
      ],
    },

    ai: {
      title: "8. AI Features",
      text: [
        "Secret Santa may provide AI-powered features for gift ideas, wishlist assistance, and questions about the service.",
        "AI-generated suggestions are provided for informational purposes. They may be incomplete, inaccurate, or unsuitable for a particular situation.",
        "You remain responsible for deciding whether and how to use any suggestion provided by the AI assistant.",
      ],
    },

    prohibited: {
      title: "9. Prohibited Use",
      intro: "You agree not to:",
      items: {
        unlawful: "use the service for unlawful purposes;",
        account: "attempt to access another user's account;",
        assignments: "attempt to reveal private Secret Santa assignments;",
        security: "interfere with the security or operation of the service;",
        malicious: "send malicious code or automated abusive requests;",
        impersonate: "impersonate another person or organization;",
        harassment: "use the service to harass or threaten other participants.",
      },
    },

    availability: {
      title: "10. Availability",
      text: [
        "We aim to keep Secret Santa available and reliable, but we cannot guarantee uninterrupted access to the service.",
        "The service may occasionally be unavailable because of maintenance, updates, technical problems, or circumstances outside our control.",
      ],
    },

    thirdParty: {
      title: "11. Third-Party Services",
      text: [
        "Secret Santa may integrate with third-party services such as Google authentication, hosting providers, databases, and AI providers.",
        "Your use of third-party services may also be subject to their own terms and policies.",
      ],
    },

    changes: {
      title: "12. Changes to the Service",
      text: [
        "We may add, modify, or remove features from Secret Santa as the service develops.",
        "We may also update these Terms when necessary. The latest version will be published on this page.",
      ],
    },

    termination: {
      title: "13. Account Suspension or Termination",
      text: [
        "Access to an account may be restricted or terminated if the account is used in violation of these Terms or in a way that threatens the security or operation of the service.",
        "You may stop using the service at any time.",
      ],
    },

    disclaimer: {
      title: "14. Disclaimer",
      text: "Secret Santa is provided on an “as available” basis. To the extent permitted by applicable law, we do not guarantee that the service will always be error-free, uninterrupted, or suitable for every particular purpose.",
    },

    contact: {
      title: "15. Contact",
      text: "If you have questions about these Terms of Service, please contact the Secret Santa service administrator through the contact method provided on the website.",
    },
  },
};

// The shape every language must match: same keys, same function signatures
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Widen<R>
    : T extends RegExp
      ? RegExp
      : T extends readonly (infer U)[]
        ? Widen<U>[]
        : T extends object
          ? { [K in keyof T]: Widen<T[K]> }
          : T;

export type Messages = Widen<typeof en>;
