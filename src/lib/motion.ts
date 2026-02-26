export const motionPresets = {
  ease: [0.22, 1, 0.36, 1] as const,
  softEase: [0.25, 0.9, 0.3, 1] as const,
  duration: {
    fast: 0.28,
    medium: 0.45,
    slow: 0.72,
    celebration: 0.95,
  },
  stagger: {
    tight: 0.06,
    section: 0.1,
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionPresets.duration.medium,
      ease: motionPresets.ease,
    },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionPresets.duration.medium,
      ease: motionPresets.ease,
    },
  },
};

export const popIn = {
  hidden: { opacity: 0, scale: 0.92, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: motionPresets.duration.fast,
      ease: motionPresets.softEase,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -6,
    transition: {
      duration: motionPresets.duration.fast,
      ease: motionPresets.softEase,
    },
  },
};

export const celebrationBurst = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: motionPresets.duration.celebration,
      ease: motionPresets.softEase,
    },
  },
};
