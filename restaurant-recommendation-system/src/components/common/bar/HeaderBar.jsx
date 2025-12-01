import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, User, LogOut, Utensils, LogIn, UserPlus } from "lucide-react";
import routes from "@utils/constants/routes";

/**
 * 헤더바 컴포넌트
 * 모든 페이지 상단에 표시되는 네비게이션 바
 * @param {object} session - 현재 사용자 세션 객체
 * @param {function} handleLogout - 로그아웃 처리 함수
 */
export default function HeaderBar({ session, handleLogout }) {
  const navigate = useNavigate();

  // 아바타 색상을 Tailwind 클래스로 매핑
  const COLOR_MAP = {
    indigo: { bg: "bg-indigo-600", hover: "hover:bg-indigo-700" },
    red: { bg: "bg-red-500", hover: "hover:bg-red-600" },
    green: { bg: "bg-green-500", hover: "hover:bg-green-600" },
    blue: { bg: "bg-blue-500", hover: "hover:bg-blue-600" },
    yellow: { bg: "bg-yellow-500", hover: "hover:bg-yellow-600" },
    purple: { bg: "bg-purple-600", hover: "hover:bg-purple-700" },
    pink: { bg: "bg-pink-500", hover: "hover:bg-pink-600" },
  };

  // 로그아웃 확인 및 처리
  const onLogoutClick = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      handleLogout();
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
      <nav className="flex items-center gap-4">
        {session ? (
          <>
            {/* 로그인된 상태 */}
            <button
              onClick={() => navigate(routes.mypage)}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                COLOR_MAP[session.user.avatarColor || "indigo"]?.bg ||
                "bg-indigo-600"
              } text-white font-bold ${
                COLOR_MAP[session.user.avatarColor || "indigo"]?.hover ||
                "hover:bg-indigo-700"
              } transition-colors`}
              aria-label="마이페이지로 이동"
            >
              {session.user.nickname[0]}
            </button>

            <button
              onClick={onLogoutClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>로그인</span>
            </button>
            <button
              onClick={() => navigate(routes.register)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>회원가입</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
