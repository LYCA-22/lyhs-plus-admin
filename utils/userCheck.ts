import type { AppDispatch } from "@/store/store";
import { apiServices } from "@/services/api";
import { updateSystemData } from "@/store/systemSlice";
import { updateUserData } from "@/store/userSlice";

function getCookie(name: string) {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const lastPart = parts.pop();
      return lastPart?.split(";")[0] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function checkUserSession(
  dispatch: AppDispatch,
  os: string,
  browser: string,
  isMobile: boolean,
) {
  try {
    const sessionId = getCookie("sessionId");
    if (!sessionId) {
      window.location.href =
        "https://auth.lyhsca.org/account/login?redirect_url=https://admin.lyhsca.org";
      return;
    }
    dispatch({ type: "systemStatus/setLoading", payload: true });
    // 請求伺服器獲得用戶資料
    const data = await apiServices.getUserData(sessionId);

    // 更新用戶資料
    dispatch(
      updateUserData({
        sessionId: sessionId,
        id: data.id,
        name: data.name,
        email: data.email,
        level: data.level,
        type: data.type,
        role: data.role,
        grade: data.grade,
        class: data.class,
        isLoggedIn: true,
      }),
    );
  } catch (error) {
    console.error("Failed to check user:", error);
  } finally {
    setTimeout(() => {
      dispatch(
        updateSystemData({
          isLoading: false,
          os: os,
          browser: browser,
          isMobile: isMobile,
        }),
      );
    }, 1000);
  }
}
