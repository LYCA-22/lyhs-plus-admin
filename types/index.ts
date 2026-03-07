export interface userMemberData {
  uuid: string;
  display_name: string;
  zh_name: string;
  role: "studentMember" | "lysaStaff" | "lyhsTeacher";
  is_disabled: boolean;
  class_name: "忠" | "仁" | "孝" | "愛" | "信" | "義";
  grade: "高一" | "高二" | "高三";
  number: number;
  stu_id: string;
  is_member: boolean;
  ksa_enabled: boolean;
  openid_account: string | null;
  openid_password: string | null;
  created_at: string;
  updated_at: string;
}
