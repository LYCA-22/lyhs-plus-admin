import type { AppDispatch } from "@/store/store";
import { apiServices } from "@/services/api";
import { updateSystemData } from "@/store/systemSlice";
import { updateUserData } from "@/store/userSlice";
import { verifySessionId } from "./verifySessionId";

export async function checkUserSession(
  dispatch: AppDispatch,
  os: string,
  browser: string,
  isMobile: boolean,
) {
  try {
    const checkFunction = (await verifySessionId()) as {
      status: boolean;
      sessionId: string;
    };

    if (checkFunction.status) {
      dispatch({ type: "systemStatus/setLoading", payload: true });
      const sessionId = checkFunction.sessionId as string;

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

      // 更新狀態
      dispatch(
        updateSystemData({
          userCheck: false,
          sessionIdValid: true,
        }),
      );
    } else {
      dispatch(
        updateSystemData({
          userCheck: true,
          sessionIdValid: false,
        }),
      );
    }
  } catch (error) {
    console.error("Failed to check user:", error);
  } finally {
    dispatch(
      updateSystemData({
        isLoading: false,
        os: os,
        browser: browser,
        isMobile: isMobile,
      }),
    );
  }
}
