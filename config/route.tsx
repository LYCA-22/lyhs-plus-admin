import {
  House,
  CalendarDots,
  EnvelopeSimple,
  User,
  UserFocus,
  EnvelopeSimpleOpen,
  Wrench,
  FolderUser,
} from "@phosphor-icons/react";

type Props = {
  title: string;
  link: string;
  icon: React.ReactNode;
  "active-icon": React.ReactNode;
};

type Items = {
  isGroup: boolean;
  title: string;
  items?: Props[];
  link?: string;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
};

export const ITEMS: Items[] = [
  {
    isGroup: false,
    title: "總覽",
    link: "/",
    icon: <House size={23} />,
    activeIcon: <House size={23} weight="fill" />,
  },
  {
    isGroup: true,
    title: "學權組",
    items: [
      {
        title: "學權信箱",
        link: "/mailList",
        icon: <EnvelopeSimple size={23} />,
        "active-icon": <EnvelopeSimpleOpen size={23} weight="fill" />,
      },
      {
        title: "報修案件",
        link: "/repair",
        icon: <Wrench size={23} />,
        "active-icon": <Wrench size={23} weight="fill" />,
      },
    ],
  },
  {
    isGroup: true,
    title: "資訊組",
    items: [
      {
        title: "註冊代碼管理",
        link: "/staff",
        icon: <UserFocus size={23} />,
        "active-icon": <UserFocus size={23} weight="fill" />,
      },
      {
        title: "使用者管理",
        link: "/user",
        icon: <User size={23} />,
        "active-icon": <User size={23} weight="fill" />,
      },
    ],
  },
  {
    isGroup: true,
    title: "文書組",
    items: [
      {
        title: "行事曆",
        link: "/calendar",
        icon: <CalendarDots size={23} />,
        "active-icon": <CalendarDots size={23} weight="fill" />,
      },
      {
        title: "會費管理",
        link: "/member",
        icon: <FolderUser size={23} />,
        "active-icon": <FolderUser size={23} weight="fill" />,
      },
    ],
  },
  {
    isGroup: true,
    title: "通用",
    items: [
      {
        title: "公告管理",
        link: "/announcement",
        icon: <FolderUser size={23} />,
        "active-icon": <FolderUser size={23} weight="fill" />,
      },
    ],
  },
];
