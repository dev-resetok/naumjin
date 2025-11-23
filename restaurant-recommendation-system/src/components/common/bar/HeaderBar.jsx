import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, User, LogOut, Utensils } from "lucide-react";
import routes from "@utils/constants/routes";
import { getCurrentUser, clearCurrentUser } from "@utils/helpers/storage";

/**
 * 헤더바 컴포넌트
 * 모든 페이지 상단에 표시되는 네비게이션 바
 */
export default function HeaderBar() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // 로그아웃 처리
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      clearCurrentUser();
      navigate(routes.home);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* 로고 */}
      <button
        onClick={() => navigate(routes.home)}
        className="flex items-center gap-2 text-2xl font-bold text-indigo-700 hover:text-indigo-800 transition-colors"
      >
        <Utensils className="w-8 h-8" />
        <span>나는 음식에 진심이다!</span>
      </button>

      {/* 네비게이션 메뉴 */}
      <div className="flex items-center gap-3">
        {currentUser ? (
          <>
            {/* 로그인된 상태 */}
            <button
              onClick={() => navigate(routes.home)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Home className="w-5 h-5 text-indigo-600" />
              <span className="text-indigo-700">홈</span>
            </button>

            <button
              onClick={() => navigate(routes.mypage)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <User className="w-5 h-5 text-indigo-600" />
              <span className="text-indigo-700">{currentUser.nickname}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>로그아웃</span>
            </button>
          </>
        ) : (
          <>
            {/* 로그인되지 않은 상태 */}
            <button
              onClick={() => navigate(routes.login)}
              className="px-4 py-2 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              로그인
            </button>
            <button
              onClick={() => navigate(routes.register)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </div>
  );
}
