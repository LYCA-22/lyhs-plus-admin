import type { AppDispatch } from "@/store/store";
import { apiServices } from "@/services/api";
import { updateSystemData } from "@/store/systemSlice";
import { updateUserData } from "@/store/userSlice";

export async function checkUserSession(
  dispatch: AppDispatch,
  os: string,
  browser: string,
  isMobile: boolean,
  sessionId: string,
) {
  try {
    dispatch({ type: "systemStatus/setLoading", payload: true });
    const data = await apiServices.getUserData(sessionId);
    if (!data) {
      window.location.href =
        "https://auth.lyhsca.org/account/login?redirect_url=https://admin.lyhsca.org";
    }
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
