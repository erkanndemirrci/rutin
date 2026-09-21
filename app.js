const {
  useState,
  useEffect,
  useMemo,
  useCallback
} = React;

/* ---------------- storage helpers ---------------- */
const STORAGE_KEY = "gunluk-rutin-v1";
function todayISO(d = new Date()) {
  const y = d.getFullYear(),
    m = String(d.getMonth() + 1).padStart(2, "0"),
    day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function dowIndex(d = new Date()) {
  // Monday = 0 ... Sunday = 6
  const js = d.getDay(); // Sun=0
  return (js + 6) % 7;
}
const DOW_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const DOW_SHORT = ["P", "S", "Ç", "P", "C", "C", "P"];
function seedData() {
  return {
    routines: [{
      id: "r1",
      title: "Uyan",
      time: "07:30",
      days: [0, 1, 2, 3, 4, 5, 6],
      note: "",
      reminder: true,
      icon: "⏰",
      color: "coral"
    }, {
      id: "r2",
      title: "Kahvaltı",
      time: "08:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      note: "",
      reminder: true,
      icon: "🍳",
      color: "coral"
    }, {
      id: "r3",
      title: "İş / Okul",
      time: "09:00",
      days: [0, 1, 2, 3, 4],
      note: "",
      reminder: false,
      icon: "💼",
      color: "sage"
    }, {
      id: "r4",
      title: "Öğle yemeği",
      time: "12:30",
      days: [0, 1, 2, 3, 4, 5, 6],
      note: "",
      reminder: false,
      icon: "🍽️",
      color: "sage"
    }, {
      id: "r5",
      title: "Kısa mola",
      time: "15:30",
      days: [0, 1, 2, 3, 4, 5, 6],
      note: "",
      reminder: false,
      icon: "☕",
      color: "indigo"
    }, {
      id: "r6",
      title: "Spor",
      time: "18:00",
      days: [0, 2, 4],
      note: "Spor çantasını akşamdan hazırla, salona gitmeden önce hafif bir şeyler ye.",
      reminder: true,
      icon: "🏋️",
      color: "coral"
    }, {
      id: "r7",
      title: "Kitap oku",
      time: "20:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      note: "",
      reminder: false,
      icon: "📖",
      color: "indigo"
    }, {
      id: "r8",
      title: "Uyku",
      time: "23:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      note: "",
      reminder: true,
      icon: "🌙",
      color: "indigo"
    }],
    habits: [{
      id: "h1",
      title: "2L su iç",
      emoji: "💧",
      tint: "sage",
      goal: 10
    }, {
      id: "h2",
      title: "20 dk kitap oku",
      emoji: "📚",
      tint: "coral",
      goal: 10
    }, {
      id: "h3",
      title: "30 dk hareket et",
      emoji: "🏃",
      tint: "tan",
      goal: 10
    }, {
      id: "h4",
      title: "10 dk meditasyon",
      emoji: "🧘",
      tint: "indigo",
      goal: 10
    }, {
      id: "h5",
      title: "Sosyal medyada daha az zaman geçir",
      emoji: "📵",
      tint: "tan",
      goal: 10
    }],
    // completion log: { "YYYY-MM-DD": { routines: {id:true}, habits: {id:count} } }
    log: {},
    profile: {
      name: "Erkan Demirci",
      dailyGoal: 80,
      theme: "light",
      notifsOn: true
    }
  };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData();
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.routines) return seedData();
    return parsed;
  } catch (e) {
    return seedData();
  }
}
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {/* ignore */}
}

/* ---------------- small icon set ---------------- */
const Icon = {
  home: (c = "#A79E90") => /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 11.5L12 4l8 7.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9"
  })),
  check: (c = "#A79E90") => /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 13l4 4L19 7"
  })),
  bars: (c = "#A79E90") => /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 20V10M12 20V4M19 20v-7"
  })),
  user: (c = "#A79E90") => /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"
  })),
  plus: (c = "#fff", s = 26) => /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })),
  back: (c = "currentColor") => /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2.2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 6l-6 6 6 6"
  })),
  chevron: (c = "#C7BEAF") => /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 6l6 6-6 6"
  })),
  clock: (c = "#8A8378") => /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 3"
  })),
  cal: (c = "#8A8378") => /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "16",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 10h18M8 3v4M16 3v4"
  })),
  bell: (c = "#8A8378") => /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.7 21a2 2 0 01-3.4 0"
  })),
  note: (c = "#8A8378") => /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "19",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4h16v16H4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 9h8M8 13h5"
  })),
  target: (c = "#E8623D") => /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 3"
  })),
  theme: (c = "#8A6D4A") => /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
  })),
  gear: (c = "#5B5347") => /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
  })),
  trash: (c = "#C4432A") => /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z"
  })),
  clockCircle: (c = "#E8623D") => /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 6v6l4 2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  })),
  emptyCal: (c = "#E8623D") => /*#__PURE__*/React.createElement("svg", {
    width: "42",
    height: "42",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: c,
    strokeWidth: "1.6"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "16",
    rx: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 10h18M8 3v4M16 3v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 15l2 2 4-4"
  }))
};
const TINTS = {
  coral: {
    bg: "var(--coral-tint)",
    fg: "var(--coral)"
  },
  sage: {
    bg: "var(--sage-tint)",
    fg: "var(--sage)"
  },
  indigo: {
    bg: "var(--indigo-tint)",
    fg: "var(--indigo)"
  },
  tan: {
    bg: "var(--tan-tint)",
    fg: "#5B5347"
  }
};

/* ---------------- derived selectors ---------------- */
function useDerived(state, dateISO) {
  return useMemo(() => {
    const dow = dowIndex(new Date(dateISO + "T00:00:00"));
    const todaysRoutines = state.routines.filter(r => r.days.includes(dow));
    const dayLog = state.log[dateISO] || {
      routines: {},
      habits: {}
    };
    const doneCount = todaysRoutines.filter(r => dayLog.routines[r.id]).length;
    const total = todaysRoutines.length;
    const pct = total ? Math.round(doneCount / total * 100) : 0;
    return {
      dow,
      todaysRoutines,
      dayLog,
      doneCount,
      total,
      pct
    };
  }, [state, dateISO]);
}

/* ---------------- Ring progress ---------------- */
function ProgressRing({
  pct
}) {
  const r = 36,
    c = 2 * Math.PI * r;
  const offset = c - c * pct / 100;
  return /*#__PURE__*/React.createElement("div", {
    className: "ring-wrap"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "84",
    height: "84",
    viewBox: "0 0 84 84"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "42",
    cy: "42",
    r: r,
    fill: "none",
    stroke: "#3A362F",
    strokeWidth: "8"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "42",
    cy: "42",
    r: r,
    fill: "none",
    stroke: "var(--coral)",
    strokeWidth: "8",
    strokeLinecap: "round",
    strokeDasharray: c,
    strokeDashoffset: offset
  })), /*#__PURE__*/React.createElement("div", {
    className: "ring-label"
  }, "%", pct));
}

/* ---------------- Tab bar ---------------- */
function TabBar({
  tab,
  setTab
}) {
  const tabs = [{
    id: "home",
    label: "Ana Sayfa",
    icon: Icon.home
  }, {
    id: "routines",
    label: "Rutinler",
    icon: Icon.check
  }, {
    id: "stats",
    label: "İstatistik",
    icon: Icon.bars
  }, {
    id: "profile",
    label: "Profil",
    icon: Icon.user
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "tabbar"
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: "tab" + (tab === t.id ? " active" : ""),
    onClick: () => setTab(t.id)
  }, t.icon(tab === t.id ? "#E8623D" : "#A79E90"), /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, t.label))));
}

/* ---------------- Home screen ---------------- */
function HomeScreen({
  state,
  dateISO,
  derived,
  onToggleRoutine,
  onOpenRoutine,
  onOpenHabit,
  onOpenAdd,
  onOpenProfile
}) {
  const hour = new Date().getHours();
  const greet = hour < 6 ? "İyi geceler" : hour < 11 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
  const firstName = (state.profile.name || "").split(" ")[0] || "";
  const sortedRoutines = [...derived.todaysRoutines].sort((a, b) => a.time.localeCompare(b.time));
  const topHabits = state.habits.slice(0, 2);
  const dayLog = derived.dayLog;
  const hype = derived.total === 0 ? "Bugün için henüz rutin yok." : derived.pct >= 100 ? "Bugünü tamamladın, tebrikler! 🎉" : derived.pct === 0 ? "İlk görevle güne başla." : derived.pct < 50 ? "İlk adımı attın, devam et!" : derived.pct < 80 ? "Harika gidiyorsun!" : "Az kaldı, bitirmek üzeresin!";
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "safe-top"
  }), /*#__PURE__*/React.createElement("div", {
    className: "page-pad fab-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "greeting"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, greet, firstName ? ", " + firstName : "", " \uD83D\uDC4B"), /*#__PURE__*/React.createElement("p", null, "Bug\xFCn i\xE7in haz\u0131r m\u0131s\u0131n?")), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    "aria-label": "Profil",
    onClick: onOpenProfile
  }, Icon.user("currentColor"))), /*#__PURE__*/React.createElement("div", {
    className: "progress-card"
  }, /*#__PURE__*/React.createElement(ProgressRing, {
    pct: derived.pct
  }), /*#__PURE__*/React.createElement("div", {
    className: "progress-copy"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Bug\xFCnk\xFC ilerlemen"), /*#__PURE__*/React.createElement("div", {
    className: "figure"
  }, derived.doneCount, " / ", derived.total, " g\xF6rev tamamland\u0131"), /*#__PURE__*/React.createElement("div", {
    className: "hype"
  }, hype))), sortedRoutines.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("h2", null, "Bug\xFCn\xFCn Rutini")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 4px",
      color: "var(--muted)",
      fontSize: 14
    }
  }, "Bug\xFCn i\xE7in planlanm\u0131\u015F bir rutin yok.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "serif"
  }, "Bug\xFCn\xFCn Rutini")), /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, sortedRoutines.map(r => {
    const isDone = !!dayLog.routines[r.id];
    return /*#__PURE__*/React.createElement("button", {
      key: r.id,
      className: "task-row" + (isDone ? " done" : ""),
      onClick: () => onOpenRoutine(r.id)
    }, /*#__PURE__*/React.createElement("span", {
      className: "check",
      onClick: e => {
        e.stopPropagation();
        onToggleRoutine(r.id);
      },
      role: "checkbox",
      "aria-checked": isDone,
      "aria-label": r.title + " tamamlandı",
      style: isDone ? {
        background: "var(--sage)",
        borderColor: "var(--sage)"
      } : {}
    }, isDone && Icon.check("#fff")), /*#__PURE__*/React.createElement("span", {
      className: "task-title"
    }, r.title), /*#__PURE__*/React.createElement("span", {
      className: "task-time"
    }, r.time));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "serif"
  }, "Al\u0131\u015Fkanl\u0131klar")), /*#__PURE__*/React.createElement("div", {
    className: "habit-grid"
  }, topHabits.map(h => {
    const count = dayLog.habits[h.id] || 0;
    const pct = Math.min(100, Math.round(count / h.goal * 100));
    const tint = TINTS[h.tint] || TINTS.tan;
    return /*#__PURE__*/React.createElement("button", {
      key: h.id,
      className: "habit-card",
      onClick: () => onOpenHabit(h.id)
    }, /*#__PURE__*/React.createElement("span", {
      className: "habit-emoji",
      style: {
        background: tint.bg
      }
    }, h.emoji), /*#__PURE__*/React.createElement("span", {
      className: "habit-name"
    }, h.title), /*#__PURE__*/React.createElement("span", {
      className: "habit-bar"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: pct + "%",
        background: tint.fg
      }
    })));
  })))), /*#__PURE__*/React.createElement("button", {
    className: "fab",
    "aria-label": "H\u0131zl\u0131 ekle",
    onClick: onOpenAdd
  }, Icon.plus()));
}

/* ---------------- Routines & Habits screen ---------------- */
function RoutinesScreen({
  state,
  dateISO,
  derived,
  onToggleRoutine,
  onOpenRoutine,
  onOpenHabit,
  onIncHabit,
  onOpenAdd
}) {
  const [segment, setSegment] = useState("routines");
  const sorted = [...derived.todaysRoutines].sort((a, b) => a.time.localeCompare(b.time));
  const dayLog = derived.dayLog;
  const done = sorted.filter(r => dayLog.routines[r.id]);
  const notDone = sorted.filter(r => !dayLog.routines[r.id]);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "safe-top"
  }), /*#__PURE__*/React.createElement("div", {
    className: "top-title"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, "Rutinler")), /*#__PURE__*/React.createElement("div", {
    className: "segmented",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: segment === "routines" ? "active" : "",
    onClick: () => setSegment("routines")
  }, "Rutinler"), /*#__PURE__*/React.createElement("button", {
    className: segment === "habits" ? "active" : "",
    onClick: () => setSegment("habits")
  }, "Al\u0131\u015Fkanl\u0131klar")), /*#__PURE__*/React.createElement("div", {
    className: "page-pad fab-pad",
    style: {
      paddingTop: 0
    }
  }, segment === "routines" ? /*#__PURE__*/React.createElement(React.Fragment, null, sorted.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 4px",
      color: "var(--muted)",
      fontSize: 14
    }
  }, "Bug\xFCn i\xE7in planlanm\u0131\u015F bir rutin yok.") : /*#__PURE__*/React.createElement(React.Fragment, null, notDone.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "group-label"
  }, "Tamamlanmad\u0131 \xB7 ", notDone.length), notDone.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.id,
    className: "task-row",
    onClick: () => onOpenRoutine(r.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "check",
    onClick: e => {
      e.stopPropagation();
      onToggleRoutine(r.id);
    },
    role: "checkbox",
    "aria-checked": "false",
    "aria-label": r.title + " tamamlandı"
  }), /*#__PURE__*/React.createElement("span", {
    className: "task-title"
  }, r.title), /*#__PURE__*/React.createElement("span", {
    className: "task-time"
  }, r.time)))), done.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "group-label"
  }, "Tamamland\u0131 \xB7 ", done.length), done.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.id,
    className: "task-row done",
    onClick: () => onOpenRoutine(r.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "check on",
    onClick: e => {
      e.stopPropagation();
      onToggleRoutine(r.id);
    },
    role: "checkbox",
    "aria-checked": "true",
    "aria-label": r.title + " tamamlandı"
  }, Icon.check("#fff")), /*#__PURE__*/React.createElement("span", {
    className: "task-title"
  }, r.title), /*#__PURE__*/React.createElement("span", {
    className: "task-time"
  }, r.time)))))) : /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, state.habits.map(h => {
    const count = dayLog.habits[h.id] || 0;
    const pct = Math.min(100, Math.round(count / h.goal * 100));
    const tint = TINTS[h.tint] || TINTS.tan;
    const finished = count >= h.goal;
    return /*#__PURE__*/React.createElement("button", {
      key: h.id,
      className: "habit-row",
      onClick: () => onOpenHabit(h.id)
    }, /*#__PURE__*/React.createElement("span", {
      className: "habit-emoji",
      style: {
        background: tint.bg
      }
    }, h.emoji), /*#__PURE__*/React.createElement("span", {
      className: "meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "name"
    }, h.title), /*#__PURE__*/React.createElement("span", {
      className: "habit-bar"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: pct + "%",
        background: tint.fg
      }
    }))), /*#__PURE__*/React.createElement("span", {
      className: "count",
      style: {
        color: finished ? "var(--coral)" : "var(--muted-2)"
      }
    }, finished ? "Bitti" : `${count}/${h.goal}`));
  }))), /*#__PURE__*/React.createElement("button", {
    className: "fab",
    "aria-label": "H\u0131zl\u0131 ekle",
    onClick: onOpenAdd
  }, Icon.plus()));
}

/* ---------------- Routine detail ---------------- */
function RoutineDetail({
  routine,
  state,
  log,
  onToggle,
  onBack,
  onDelete,
  onEdit
}) {
  const dayLog = log.routines || {};
  const isDone = !!dayLog[routine.id];
  const tint = TINTS[routine.color] || TINTS.coral;

  // streak: consecutive days (looking back) where this routine's scheduled day was completed
  const streak = useMemo(() => {
    let s = 0;
    let cursor = new Date();
    for (let i = 0; i < 60; i++) {
      const iso = todayISO(cursor);
      const dow = dowIndex(cursor);
      if (routine.days.includes(dow)) {
        const entry = state.log[iso];
        if (entry && entry.routines && entry.routines[routine.id]) {
          s++;
        } else if (iso === todayISO()) {/* today not yet done, don't break streak count */} else break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return s;
  }, [state, routine]);
  const last5 = useMemo(() => {
    const arr = [];
    let cursor = new Date();
    let count = 0,
      guard = 0;
    while (count < 5 && guard < 30) {
      const iso = todayISO(cursor);
      const dow = dowIndex(cursor);
      if (routine.days.includes(dow)) {
        const entry = state.log[iso];
        arr.unshift(!!(entry && entry.routines && entry.routines[routine.id]));
        count++;
      }
      cursor.setDate(cursor.getDate() - 1);
      guard++;
    }
    while (arr.length < 5) arr.unshift(false);
    return arr;
  }, [state, routine]);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "safe-top"
  }), /*#__PURE__*/React.createElement("div", {
    className: "page-pad",
    style: {
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-row",
    style: {
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn card",
    "aria-label": "Geri",
    onClick: onBack
  }, Icon.back()), /*#__PURE__*/React.createElement("h1", {
    className: "serif",
    style: {
      fontSize: 19
    }
  }, "Rutin Detay\u0131")), /*#__PURE__*/React.createElement("div", {
    className: "detail-hero"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      background: tint.bg
    }
  }, Icon.clockCircle(tint.fg)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, routine.title), /*#__PURE__*/React.createElement("p", null, routine.time, routine.days.length === 7 ? " · Her gün" : " · " + routine.days.map(d => DOW_LABELS[d]).join(", ")))), /*#__PURE__*/React.createElement("div", {
    className: "info-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "info-row"
  }, Icon.clock(), /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Saat"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, routine.time)), /*#__PURE__*/React.createElement("div", {
    className: "info-row"
  }, Icon.cal(), /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Tekrar"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, routine.days.length === 7 ? "Her gün" : routine.days.map(d => DOW_LABELS[d]).join(", "))), /*#__PURE__*/React.createElement("div", {
    className: "info-row"
  }, Icon.bell(), /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Hat\u0131rlat\u0131c\u0131"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, routine.reminder ? "Açık" : "Kapalı")), routine.note ? /*#__PURE__*/React.createElement("div", {
    className: "info-row"
  }, Icon.note(), /*#__PURE__*/React.createElement("span", {
    className: "note"
  }, routine.note)) : null), /*#__PURE__*/React.createElement("div", {
    className: "streak-card"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lab"
  }, "Bu rutindeki serin"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, streak, " g\xFCn ", streak > 0 ? "🔥" : "")), /*#__PURE__*/React.createElement("div", {
    className: "bars"
  }, last5.map((v, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: v ? "on" : ""
  })))), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    style: isDone ? {
      background: "var(--sage)",
      boxShadow: "none"
    } : {},
    onClick: onToggle
  }, isDone ? "Tamamlandı olarak işaretlendi ✓" : "Tamamlandı olarak işaretle")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 22px calc(24px + env(safe-area-inset-bottom,0px)) 22px",
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: onEdit
  }, "D\xFCzenle"), /*#__PURE__*/React.createElement("button", {
    className: "btn-danger",
    onClick: onDelete
  }, "Sil")));
}

/* ---------------- Habit detail ---------------- */
function HabitDetail({
  habit,
  log,
  onInc,
  onDec,
  onBack,
  onDelete
}) {
  const count = (log.habits || {})[habit.id] || 0;
  const tint = TINTS[habit.tint] || TINTS.tan;
  const pct = Math.min(100, Math.round(count / habit.goal * 100));
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "safe-top"
  }), /*#__PURE__*/React.createElement("div", {
    className: "page-pad",
    style: {
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-row",
    style: {
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn card",
    "aria-label": "Geri",
    onClick: onBack
  }, Icon.back()), /*#__PURE__*/React.createElement("h1", {
    className: "serif",
    style: {
      fontSize: 19
    }
  }, "Al\u0131\u015Fkanl\u0131k")), /*#__PURE__*/React.createElement("div", {
    className: "detail-hero"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      background: tint.bg,
      fontSize: 24
    }
  }, habit.emoji), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, habit.title), /*#__PURE__*/React.createElement("p", null, "G\xFCnl\xFCk hedef: ", habit.goal))), /*#__PURE__*/React.createElement("div", {
    className: "chart-card"
  }, /*#__PURE__*/React.createElement("h3", null, "Bug\xFCnk\xFC ilerleme"), /*#__PURE__*/React.createElement("div", {
    className: "habit-bar",
    style: {
      height: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: pct + "%",
      background: tint.fg
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--muted)",
      fontWeight: 600
    }
  }, count, " / ", habit.goal), /*#__PURE__*/React.createElement("div", {
    className: "btn-row",
    style: {
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    style: {
      padding: "10px 16px"
    },
    onClick: onDec
  }, "\u2212"), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    style: {
      padding: "10px 16px"
    },
    onClick: onInc
  }, "+ Bir tane ekle"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 22px calc(24px + env(safe-area-inset-bottom,0px)) 22px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-danger",
    style: {
      width: "100%"
    },
    onClick: onDelete
  }, "Al\u0131\u015Fkanl\u0131\u011F\u0131 sil")));
}

/* ---------------- Quick add sheet ---------------- */
function QuickAddSheet({
  onClose,
  onPick
}) {
  const options = [{
    id: "routine",
    icon: "🕓",
    bg: "var(--coral-tint)",
    title: "Yeni rutin",
    sub: "Günlük tekrar eden bir plan oluştur"
  }, {
    id: "task",
    icon: "✓",
    bg: "var(--sage-tint)",
    title: "Yeni görev",
    sub: "Tek seferlik bir görev ekle"
  }, {
    id: "habit",
    icon: "🌿",
    bg: "var(--tan-tint)",
    title: "Yeni alışkanlık",
    sub: "Her gün takip edeceğin bir alışkanlık"
  }, {
    id: "reminder",
    icon: "🔔",
    bg: "var(--indigo-tint)",
    title: "Hatırlatıcı",
    sub: "Belirli bir saat için uyarı kur"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "grabber"
  }), /*#__PURE__*/React.createElement("h3", null, "Ne eklemek istersin?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.id,
    className: "option-row",
    onClick: () => onPick(o.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      background: o.bg
    }
  }, o.icon), /*#__PURE__*/React.createElement("span", {
    className: "txt"
  }, /*#__PURE__*/React.createElement("strong", null, o.title), /*#__PURE__*/React.createElement("span", null, o.sub)), Icon.chevron()))), /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost",
    onClick: onClose
  }, "Vazge\xE7")));
}

/* ---------------- New routine/task/habit form sheet ---------------- */
function NewRoutineSheet({
  initial,
  mode,
  onClose,
  onSave
}) {
  const isTask = mode === "task";
  const [title, setTitle] = useState(initial?.title || "");
  const [time, setTime] = useState(initial?.time || "09:00");
  const [days, setDays] = useState(initial?.days || (isTask ? [dowIndex()] : [0, 1, 2, 3, 4, 5, 6]));
  const [note, setNote] = useState(initial?.note || "");
  const [reminder, setReminder] = useState(initial?.reminder ?? true);
  const toggleDay = i => {
    setDays(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i].sort());
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "grabber"
  }), /*#__PURE__*/React.createElement("h3", null, initial ? "Rutini düzenle" : isTask ? "Yeni görev" : "Yeni rutin"), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "rt-title"
  }, "Ba\u015Fl\u0131k"), /*#__PURE__*/React.createElement("input", {
    id: "rt-title",
    type: "text",
    value: title,
    onChange: e => setTitle(e.target.value),
    placeholder: "\xD6rn. Spor"
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "rt-time"
  }, "Saat"), /*#__PURE__*/React.createElement("input", {
    id: "rt-time",
    type: "time",
    value: time,
    onChange: e => setTime(e.target.value)
  })), !isTask && /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Tekrar g\xFCnleri"), /*#__PURE__*/React.createElement("div", {
    className: "day-picker"
  }, DOW_LABELS.map((lab, i) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: i,
    className: "day-chip" + (days.includes(i) ? " on" : ""),
    onClick: () => toggleDay(i)
  }, lab)))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "rt-note"
  }, "Not (opsiyonel)"), /*#__PURE__*/React.createElement("textarea", {
    id: "rt-note",
    value: note,
    onChange: e => setNote(e.target.value),
    placeholder: "K\u0131sa bir not ekle"
  })), /*#__PURE__*/React.createElement("div", {
    className: "notif-toggle-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, /*#__PURE__*/React.createElement("strong", null, "Hat\u0131rlat\u0131c\u0131"), /*#__PURE__*/React.createElement("span", null, "Saatinde bildirim g\xF6nder")), /*#__PURE__*/React.createElement("button", {
    className: "switch " + (reminder ? "on" : "off"),
    onClick: () => setReminder(r => !r),
    "aria-label": "Hat\u0131rlat\u0131c\u0131y\u0131 a\xE7/kapat",
    "aria-pressed": reminder
  })), /*#__PURE__*/React.createElement("div", {
    className: "btn-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: onClose
  }, "Vazge\xE7"), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => {
      if (!title.trim()) return;
      onSave({
        id: initial?.id || "r" + Date.now(),
        title: title.trim(),
        time,
        days: isTask ? [dowIndex()] : days.length ? days : [0, 1, 2, 3, 4, 5, 6],
        note: note.trim(),
        reminder,
        icon: initial?.icon || "🕓",
        color: initial?.color || "coral"
      });
    }
  }, "Kaydet"))));
}
function NewHabitSheet({
  onClose,
  onSave
}) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🌿");
  const [goal, setGoal] = useState(10);
  const emojiOptions = ["🌿", "💧", "📚", "🏃", "🧘", "📵", "🎯", "🥗", "😴", "✍️"];
  return /*#__PURE__*/React.createElement("div", {
    className: "overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "grabber"
  }), /*#__PURE__*/React.createElement("h3", null, "Yeni al\u0131\u015Fkanl\u0131k"), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "hb-title"
  }, "Ba\u015Fl\u0131k"), /*#__PURE__*/React.createElement("input", {
    id: "hb-title",
    type: "text",
    value: title,
    onChange: e => setTitle(e.target.value),
    placeholder: "\xD6rn. 2L su i\xE7"
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Simge"), /*#__PURE__*/React.createElement("div", {
    className: "day-picker"
  }, emojiOptions.map(e => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: e,
    className: "day-chip" + (emoji === e ? " on" : ""),
    style: {
      fontSize: 16
    },
    onClick: () => setEmoji(e)
  }, e)))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "hb-goal"
  }, "G\xFCnl\xFCk hedef (tekrar say\u0131s\u0131)"), /*#__PURE__*/React.createElement("input", {
    id: "hb-goal",
    type: "number",
    min: "1",
    max: "30",
    value: goal,
    onChange: e => setGoal(Number(e.target.value) || 1)
  })), /*#__PURE__*/React.createElement("div", {
    className: "btn-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: onClose
  }, "Vazge\xE7"), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => {
      if (!title.trim()) return;
      onSave({
        id: "h" + Date.now(),
        title: title.trim(),
        emoji,
        tint: "sage",
        goal
      });
    }
  }, "Kaydet"))));
}
function ReminderSheet({
  onClose,
  onSave
}) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  return /*#__PURE__*/React.createElement("div", {
    className: "overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "grabber"
  }), /*#__PURE__*/React.createElement("h3", null, "Hat\u0131rlat\u0131c\u0131"), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "rm-title"
  }, "Ne i\xE7in?"), /*#__PURE__*/React.createElement("input", {
    id: "rm-title",
    type: "text",
    value: title,
    onChange: e => setTitle(e.target.value),
    placeholder: "\xD6rn. \u0130la\xE7 saati"
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "rm-time"
  }, "Saat"), /*#__PURE__*/React.createElement("input", {
    id: "rm-time",
    type: "time",
    value: time,
    onChange: e => setTime(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "btn-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: onClose
  }, "Vazge\xE7"), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => {
      if (title.trim()) onSave({
        title: title.trim(),
        time
      });
    }
  }, "Kaydet"))));
}

/* ---------------- Stats screen ---------------- */
function StatsScreen({
  state
}) {
  const last14 = useMemo(() => {
    const days = [];
    let cursor = new Date();
    for (let i = 0; i < 14; i++) {
      const iso = todayISO(cursor);
      const dow = dowIndex(cursor);
      const scheduled = state.routines.filter(r => r.days.includes(dow));
      const entry = state.log[iso] || {
        routines: {}
      };
      const done = scheduled.filter(r => entry.routines[r.id]).length;
      days.unshift({
        iso,
        dow,
        done,
        total: scheduled.length,
        pct: scheduled.length ? done / scheduled.length : 0
      });
      cursor.setDate(cursor.getDate() - 1);
    }
    return days;
  }, [state]);
  const last7 = last14.slice(7);
  const todayIso = todayISO();
  const todayEntry = last14.find(d => d.iso === todayIso) || {
    pct: 0
  };
  const dailyPct = Math.round(todayEntry.pct * 100);
  const weeklyAvg = Math.round(last7.reduce((s, d) => s + d.pct, 0) / (last7.length || 1) * 100);
  const totalCompleted = useMemo(() => {
    let sum = 0;
    Object.values(state.log).forEach(entry => {
      sum += Object.values(entry.routines || {}).filter(Boolean).length;
    });
    return sum;
  }, [state]);

  // longest streak across the whole log (days where pct === 1 and total > 0), consecutive
  const longestStreak = useMemo(() => {
    let best = 0,
      cur = 0;
    let cursor = new Date();
    cursor.setDate(cursor.getDate() - 120);
    for (let i = 0; i < 121; i++) {
      const iso = todayISO(cursor);
      const dow = dowIndex(cursor);
      const scheduled = state.routines.filter(r => r.days.includes(dow));
      const entry = state.log[iso];
      const done = scheduled.length > 0 && scheduled.every(r => entry && entry.routines && entry.routines[r.id]);
      if (done) {
        cur++;
        best = Math.max(best, cur);
      } else {
        cur = 0;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return best;
  }, [state]);
  const habitStats = useMemo(() => {
    return state.habits.map(h => {
      let hit = 0,
        days = 0;
      Object.values(state.log).forEach(entry => {
        days++;
        const c = (entry.habits || {})[h.id] || 0;
        if (c >= h.goal) hit++;
      });
      const pct = days ? Math.round(hit / days * 100) : 0;
      return {
        ...h,
        pct
      };
    }).sort((a, b) => b.pct - a.pct).slice(0, 3);
  }, [state]);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "safe-top"
  }), /*#__PURE__*/React.createElement("div", {
    className: "top-title"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, "\u0130statistikler")), /*#__PURE__*/React.createElement("div", {
    className: "page-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-grid2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-tile dark"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lab"
  }, "G\xFCnl\xFCk oran"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, "%", dailyPct)), /*#__PURE__*/React.createElement("div", {
    className: "stat-tile light"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lab"
  }, "En uzun seri"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, longestStreak, " g\xFCn ", longestStreak > 0 ? "🔥" : ""))), /*#__PURE__*/React.createElement("div", {
    className: "stat-grid2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-tile light"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lab"
  }, "Tamamlanan g\xF6rev"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, totalCompleted)), /*#__PURE__*/React.createElement("div", {
    className: "stat-tile light"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lab"
  }, "Haftal\u0131k ba\u015Far\u0131"), /*#__PURE__*/React.createElement("span", {
    className: "val",
    style: {
      color: "var(--sage)"
    }
  }, "%", weeklyAvg))), /*#__PURE__*/React.createElement("div", {
    className: "chart-card"
  }, /*#__PURE__*/React.createElement("h3", null, "Bu hafta"), /*#__PURE__*/React.createElement("div", {
    className: "bar-chart"
  }, last7.map(d => {
    const h = Math.max(6, Math.round(d.pct * 96));
    const isToday = d.iso === todayIso;
    return /*#__PURE__*/React.createElement("div", {
      key: d.iso,
      className: "bar-col" + (isToday ? " is-today" : "")
    }, /*#__PURE__*/React.createElement("div", {
      className: "bar" + (isToday ? " today" : d.pct >= 0.7 ? " hi" : ""),
      style: {
        height: h + "px"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "dlabel"
    }, DOW_SHORT[d.dow]));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head",
    style: {
      padding: "2px"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: 16
    }
  }, "En s\u0131k tamamlanan al\u0131\u015Fkanl\u0131klar")), habitStats.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--muted)",
      fontSize: 14,
      padding: "4px 2px"
    }
  }, "Hen\xFCz veri yok.") : habitStats.map(h => {
    const tint = TINTS[h.tint] || TINTS.tan;
    return /*#__PURE__*/React.createElement("div", {
      key: h.id,
      className: "rank-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "e"
    }, h.emoji), /*#__PURE__*/React.createElement("span", {
      className: "n"
    }, h.title), /*#__PURE__*/React.createElement("span", {
      className: "track"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: h.pct + "%",
        background: tint.fg
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "p",
      style: {
        color: tint.fg
      }
    }, "%", h.pct));
  }))));
}

/* ---------------- Calendar screen ---------------- */
function CalendarScreen({
  state,
  onBack
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selected, setSelected] = useState(todayISO());
  const monthLabel = cursor.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric"
  });
  const cells = useMemo(() => {
    const year = cursor.getFullYear(),
      month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = dowIndex(first); // Monday-first offset
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      const iso = todayISO(dt);
      const dow = dowIndex(dt);
      const scheduled = state.routines.filter(r => r.days.includes(dow));
      const entry = state.log[iso];
      const doneCount = scheduled.filter(r => entry && entry.routines && entry.routines[r.id]).length;
      let status = "future";
      if (scheduled.length === 0) {
        status = doneCount > 0 ? "partial" : "none-yet";
      } else if (doneCount === scheduled.length) {
        status = "done";
      } else if (doneCount > 0) {
        status = "partial";
      } else {
        status = iso < todayISO() ? "none-yet" : "future";
      }
      arr.push({
        iso,
        day: d,
        status,
        isToday: iso === todayISO(),
        scheduled: scheduled.length,
        doneCount
      });
    }
    return arr;
  }, [cursor, state]);
  const selectedCell = cells.find(c => c && c.iso === selected);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "safe-top"
  }), /*#__PURE__*/React.createElement("div", {
    className: "page-pad",
    style: {
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-row",
    style: {
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn card",
    "aria-label": "Geri",
    onClick: onBack
  }, Icon.back()), /*#__PURE__*/React.createElement("h1", {
    className: "serif",
    style: {
      fontSize: 20
    }
  }, "Takvim")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn small card",
    "aria-label": "\xD6nceki ay",
    onClick: () => setCursor(c => {
      const n = new Date(c);
      n.setMonth(n.getMonth() - 1);
      return n;
    })
  }, Icon.back()), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn small card",
    "aria-label": "Sonraki ay",
    onClick: () => setCursor(c => {
      const n = new Date(c);
      n.setMonth(n.getMonth() + 1);
      return n;
    })
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 6l6 6-6 6"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "cal-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cal-nav"
  }, /*#__PURE__*/React.createElement("span", {
    className: "m"
  }, monthLabel)), /*#__PURE__*/React.createElement("div", {
    className: "cal-grid"
  }, DOW_LABELS.map(l => /*#__PURE__*/React.createElement("div", {
    key: l,
    className: "cal-dow"
  }, l.slice(0, 2))), cells.map((c, i) => c ? /*#__PURE__*/React.createElement("button", {
    key: c.iso,
    className: "cal-day " + c.status + (c.isToday ? " today" : "") + (selected === c.iso ? " selected" : ""),
    onClick: () => setSelected(c.iso)
  }, c.day) : /*#__PURE__*/React.createElement("div", {
    key: "e" + i
  }))), /*#__PURE__*/React.createElement("div", {
    className: "cal-legend"
  }, /*#__PURE__*/React.createElement("span", {
    className: "item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "var(--sage)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "Tamamland\u0131")), /*#__PURE__*/React.createElement("span", {
    className: "item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "var(--amber-tint)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "K\u0131smen")), /*#__PURE__*/React.createElement("span", {
    className: "item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "var(--line)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "Ba\u015Flanmad\u0131")))), selectedCell && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head",
    style: {
      padding: "2px"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: 16
    }
  }, selectedCell.day, " ", monthLabel.split(" ")[0], selectedCell.isToday ? " · Bugün" : "")), /*#__PURE__*/React.createElement("div", {
    className: "day-detail-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: "var(--coral-tint)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, Icon.clockCircle()), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700
    }
  }, selectedCell.doneCount, " / ", selectedCell.scheduled, " g\xF6rev tamamland\u0131"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--muted)",
      marginTop: 2
    }
  }, selectedCell.scheduled ? `%${Math.round(selectedCell.doneCount / selectedCell.scheduled * 100)} tamamlanma oranı` : "Planlanmış rutin yok"))))));
}

/* ---------------- Notifications screen ---------------- */
function NotificationsScreen({
  state,
  onBack,
  onToggleNotifs
}) {
  const upcoming = [...state.routines].filter(r => r.reminder).sort((a, b) => a.time.localeCompare(b.time));
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "safe-top"
  }), /*#__PURE__*/React.createElement("div", {
    className: "page-pad",
    style: {
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-row",
    style: {
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn card",
    "aria-label": "Geri",
    onClick: onBack
  }, Icon.back()), /*#__PURE__*/React.createElement("h1", {
    className: "serif",
    style: {
      fontSize: 19
    }
  }, "Bildirimler")), /*#__PURE__*/React.createElement("div", {
    className: "notif-toggle-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, /*#__PURE__*/React.createElement("strong", null, "T\xFCm hat\u0131rlat\u0131c\u0131lar"), /*#__PURE__*/React.createElement("span", null, "Bildirimleri a\xE7 ya da kapat")), /*#__PURE__*/React.createElement("button", {
    className: "switch " + (state.profile.notifsOn ? "on" : "off"),
    onClick: onToggleNotifs,
    "aria-pressed": state.profile.notifsOn,
    "aria-label": "Bildirimleri a\xE7/kapat"
  })), /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "group-label"
  }, "Bug\xFCn"), upcoming.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--muted)",
      fontSize: 14,
      padding: "4px 2px"
    }
  }, "Hat\u0131rlat\u0131c\u0131s\u0131 a\xE7\u0131k bir rutin yok.") : upcoming.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "notif-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      background: "var(--coral-tint)"
    }
  }, r.icon), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("strong", null, r.time, " \u2014 ", r.title), /*#__PURE__*/React.createElement("span", null, "Bug\xFCn ", r.time, "'de")), state.profile.notifsOn && /*#__PURE__*/React.createElement("span", {
    className: "dot-live"
  }))))));
}

/* ---------------- Profile screen ---------------- */
function ProfileScreen({
  state,
  onOpenNotifs,
  onOpenRoutines,
  onOpenCalendar,
  onToggleTheme,
  onSetGoal
}) {
  const initial = (state.profile.name || "?").trim().charAt(0).toUpperCase();
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "safe-top"
  }), /*#__PURE__*/React.createElement("div", {
    className: "top-title"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, "Profil")), /*#__PURE__*/React.createElement("div", {
    className: "page-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "profile-hero"
  }, /*#__PURE__*/React.createElement("span", {
    className: "avatar"
  }, /*#__PURE__*/React.createElement("span", null, initial)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "name serif"
  }, state.profile.name), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "G\xFCnl\xFCk hedef: %", state.profile.dailyGoal))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "group-label"
  }, "Hedefler"), /*#__PURE__*/React.createElement("div", {
    className: "settings-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "settings-row",
    style: {
      cursor: "default"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      background: "var(--coral-tint)"
    }
  }, Icon.target()), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "G\xFCnl\xFCk hedef"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "10",
    max: "100",
    step: "5",
    value: state.profile.dailyGoal,
    onChange: e => onSetGoal(Number(e.target.value) || 80),
    style: {
      width: 56,
      textAlign: "right",
      border: "none",
      background: "none",
      fontSize: 14,
      fontWeight: 700,
      color: "var(--muted)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: "var(--muted)"
    }
  }, "%")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "group-label"
  }, "Ayarlar"), /*#__PURE__*/React.createElement("div", {
    className: "settings-card"
  }, /*#__PURE__*/React.createElement("button", {
    className: "settings-row",
    onClick: onOpenNotifs
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      background: "var(--indigo-tint)"
    }
  }, Icon.bell()), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "Bildirim ayarlar\u0131"), Icon.chevron()), /*#__PURE__*/React.createElement("button", {
    className: "settings-row",
    onClick: onToggleTheme
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      background: "var(--tan-tint)"
    }
  }, Icon.theme()), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "Tema"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, state.profile.theme === "dark" ? "Koyu" : "Açık")), /*#__PURE__*/React.createElement("button", {
    className: "settings-row",
    onClick: onOpenRoutines
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      background: "var(--sage-tint)"
    }
  }, Icon.check("#4A9B7F")), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "Rutinleri d\xFCzenle"), Icon.chevron()), /*#__PURE__*/React.createElement("button", {
    className: "settings-row",
    onClick: onOpenCalendar
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      background: "var(--coral-tint)"
    }
  }, Icon.cal("#E8623D")), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "Takvim"), Icon.chevron()), /*#__PURE__*/React.createElement("div", {
    className: "settings-row",
    style: {
      cursor: "default"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico",
    style: {
      background: "var(--line)"
    }
  }, Icon.gear()), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "Uygulama ayarlar\u0131"), Icon.chevron())))));
}

/* ---------------- Empty state ---------------- */
function EmptyState({
  onAdd
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "safe-top"
  }), /*#__PURE__*/React.createElement("div", {
    className: "top-title"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, "Rutinler")), /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, Icon.emptyCal()), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Bug\xFCn i\xE7in hen\xFCz bir rutinin yok."), /*#__PURE__*/React.createElement("p", null, "\u0130lk rutinini olu\u015Fturmaya ne dersin?")), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary cta",
    onClick: onAdd
  }, Icon.plus("#fff", 18), " Rutin olu\u015Ftur")));
}

/* ---------------- Root App ---------------- */
function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState("home");
  const [route, setRoute] = useState({
    screen: "home"
  }); // overrides tab content when set (detail views)
  const [sheet, setSheet] = useState(null); // 'add' | 'newRoutine' | 'newTask' | 'newHabit' | 'newReminder'
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [toast, setToast] = useState(null);
  const dateISO = todayISO();
  const derived = useDerived(state, dateISO);
  useEffect(() => {
    saveState(state);
  }, [state]);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.profile.theme === "dark" ? "dark" : "light");
  }, [state.profile.theme]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);
  const updateLog = useCallback(mutator => {
    setState(s => {
      const day = s.log[dateISO] ? {
        routines: {
          ...s.log[dateISO].routines
        },
        habits: {
          ...s.log[dateISO].habits
        }
      } : {
        routines: {},
        habits: {}
      };
      mutator(day);
      return {
        ...s,
        log: {
          ...s.log,
          [dateISO]: day
        }
      };
    });
  }, [dateISO]);
  const toggleRoutine = useCallback(id => {
    let willBeDone = false;
    updateLog(day => {
      willBeDone = !day.routines[id];
      day.routines[id] = willBeDone;
    });
    setToast(willBeDone ? "Tamamlandı ✓" : "İşaret kaldırıldı");
  }, [updateLog]);
  const incHabit = useCallback((id, delta) => {
    updateLog(day => {
      const cur = day.habits[id] || 0;
      day.habits[id] = Math.max(0, cur + delta);
    });
  }, [updateLog]);
  const goTab = t => {
    setTab(t);
    setRoute({
      screen: t
    });
  };
  const openRoutine = id => setRoute({
    screen: "routineDetail",
    id
  });
  const openHabit = id => setRoute({
    screen: "habitDetail",
    id
  });
  const openNotifs = () => setRoute({
    screen: "notifications"
  });
  const openProfile = () => {
    setTab("profile");
    setRoute({
      screen: "profile"
    });
  };
  const saveRoutine = r => {
    setState(s => {
      const exists = s.routines.some(x => x.id === r.id);
      return {
        ...s,
        routines: exists ? s.routines.map(x => x.id === r.id ? r : x) : [...s.routines, r]
      };
    });
    setSheet(null);
    setEditingRoutine(null);
    setToast("Kaydedildi");
    if (route.screen === "routineDetail") setRoute({
      screen: "routineDetail",
      id: r.id
    });
  };
  const saveHabit = h => {
    setState(s => ({
      ...s,
      habits: [...s.habits, h]
    }));
    setSheet(null);
    setToast("Alışkanlık eklendi");
  };
  const saveReminder = ({
    title,
    time
  }) => {
    const r = {
      id: "r" + Date.now(),
      title,
      time,
      days: [0, 1, 2, 3, 4, 5, 6],
      note: "",
      reminder: true,
      icon: "🔔",
      color: "indigo"
    };
    setState(s => ({
      ...s,
      routines: [...s.routines, r]
    }));
    setSheet(null);
    setToast("Hatırlatıcı eklendi");
  };
  const deleteRoutine = id => {
    setState(s => ({
      ...s,
      routines: s.routines.filter(r => r.id !== id)
    }));
    setRoute({
      screen: "routines"
    });
    setTab("routines");
    setToast("Rutin silindi");
  };
  const deleteHabit = id => {
    setState(s => ({
      ...s,
      habits: s.habits.filter(h => h.id !== id)
    }));
    setRoute({
      screen: "routines"
    });
    setTab("routines");
    setToast("Alışkanlık silindi");
  };
  const currentRoutine = route.id ? state.routines.find(r => r.id === route.id) : null;
  const currentHabit = route.id ? state.habits.find(h => h.id === route.id) : null;
  let body;
  if (route.screen === "routineDetail" && currentRoutine) {
    body = /*#__PURE__*/React.createElement(RoutineDetail, {
      routine: currentRoutine,
      state: state,
      log: derived.dayLog,
      onToggle: () => toggleRoutine(currentRoutine.id),
      onBack: () => {
        setRoute({
          screen: "routines"
        });
        setTab("routines");
      },
      onDelete: () => deleteRoutine(currentRoutine.id),
      onEdit: () => {
        setEditingRoutine(currentRoutine);
        setSheet("editRoutine");
      }
    });
  } else if (route.screen === "habitDetail" && currentHabit) {
    body = /*#__PURE__*/React.createElement(HabitDetail, {
      habit: currentHabit,
      log: derived.dayLog,
      onInc: () => incHabit(currentHabit.id, 1),
      onDec: () => incHabit(currentHabit.id, -1),
      onBack: () => {
        setRoute({
          screen: "routines"
        });
        setTab("routines");
      },
      onDelete: () => deleteHabit(currentHabit.id)
    });
  } else if (route.screen === "notifications") {
    body = /*#__PURE__*/React.createElement(NotificationsScreen, {
      state: state,
      onBack: () => {
        setRoute({
          screen: "profile"
        });
        setTab("profile");
      },
      onToggleNotifs: () => setState(s => ({
        ...s,
        profile: {
          ...s.profile,
          notifsOn: !s.profile.notifsOn
        }
      }))
    });
  } else if (route.screen === "calendar") {
    body = /*#__PURE__*/React.createElement(CalendarScreen, {
      state: state,
      onBack: () => {
        setRoute({
          screen: "profile"
        });
        setTab("profile");
      }
    });
  } else if (tab === "home") {
    body = derived.todaysRoutines.length === 0 && state.routines.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
      onAdd: () => setSheet("add")
    }) : /*#__PURE__*/React.createElement(HomeScreen, {
      state: state,
      dateISO: dateISO,
      derived: derived,
      onToggleRoutine: toggleRoutine,
      onOpenRoutine: openRoutine,
      onOpenHabit: openHabit,
      onOpenAdd: () => setSheet("add"),
      onOpenProfile: openProfile
    });
  } else if (tab === "routines") {
    body = state.routines.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
      onAdd: () => setSheet("add")
    }) : /*#__PURE__*/React.createElement(RoutinesScreen, {
      state: state,
      dateISO: dateISO,
      derived: derived,
      onToggleRoutine: toggleRoutine,
      onOpenRoutine: openRoutine,
      onOpenHabit: openHabit,
      onIncHabit: incHabit,
      onOpenAdd: () => setSheet("add")
    });
  } else if (tab === "stats") {
    body = /*#__PURE__*/React.createElement(StatsScreen, {
      state: state
    });
  } else if (tab === "profile") {
    body = /*#__PURE__*/React.createElement(ProfileScreen, {
      state: state,
      onOpenNotifs: openNotifs,
      onOpenRoutines: () => {
        setTab("routines");
        setRoute({
          screen: "routines"
        });
      },
      onOpenCalendar: () => setRoute({
        screen: "calendar"
      }),
      onToggleTheme: () => setState(s => ({
        ...s,
        profile: {
          ...s.profile,
          theme: s.profile.theme === "dark" ? "light" : "dark"
        }
      })),
      onSetGoal: v => setState(s => ({
        ...s,
        profile: {
          ...s.profile,
          dailyGoal: v
        }
      }))
    });
  }
  const showTabBar = ["home", "routines", "stats", "profile"].includes(route.screen) || !route.screen || route.screen === tab;
  const hideTabBarScreens = ["routineDetail", "habitDetail", "notifications", "calendar"];
  return /*#__PURE__*/React.createElement(React.Fragment, null, body, !hideTabBarScreens.includes(route.screen) && /*#__PURE__*/React.createElement(TabBar, {
    tab: tab,
    setTab: goTab
  }), /*#__PURE__*/React.createElement("div", {
    className: "safe-bottom"
  }), sheet === "add" && /*#__PURE__*/React.createElement(QuickAddSheet, {
    onClose: () => setSheet(null),
    onPick: id => {
      if (id === "routine") setSheet("newRoutine");else if (id === "task") setSheet("newTask");else if (id === "habit") setSheet("newHabit");else if (id === "reminder") setSheet("newReminder");
    }
  }), sheet === "newRoutine" && /*#__PURE__*/React.createElement(NewRoutineSheet, {
    mode: "routine",
    onClose: () => setSheet(null),
    onSave: saveRoutine
  }), sheet === "newTask" && /*#__PURE__*/React.createElement(NewRoutineSheet, {
    mode: "task",
    onClose: () => setSheet(null),
    onSave: saveRoutine
  }), sheet === "editRoutine" && editingRoutine && /*#__PURE__*/React.createElement(NewRoutineSheet, {
    mode: "routine",
    initial: editingRoutine,
    onClose: () => {
      setSheet(null);
      setEditingRoutine(null);
    },
    onSave: saveRoutine
  }), sheet === "newHabit" && /*#__PURE__*/React.createElement(NewHabitSheet, {
    onClose: () => setSheet(null),
    onSave: saveHabit
  }), sheet === "newReminder" && /*#__PURE__*/React.createElement(ReminderSheet, {
    onClose: () => setSheet(null),
    onSave: saveReminder
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, toast));
}
const root = ReactDOM.createRoot(document.getElementById("app-root"));
root.render(/*#__PURE__*/React.createElement(App, null));
