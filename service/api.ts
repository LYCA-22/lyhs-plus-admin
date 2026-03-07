import { userMemberData } from "@/types";

const API_BASE_URL = "https://api.lyhssa.org";

export const ApiService = {
  async getUserData(access_token: string): Promise<userMemberData> {
    const response = await fetch(`${API_BASE_URL}/v1/user/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();
    return data.data as userMemberData;
  },
};
