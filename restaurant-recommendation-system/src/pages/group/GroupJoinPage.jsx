import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "@common/bar/HeaderBar";
import Button from "@common/button/Button";
import { Input } from "@components/common/Input";
import { useToast } from "@components/common/Toast";
import routes from "@utils/constants/routes";
import { joinGroup } from "@utils/helpers/storage";
import { Users } from "lucide-react";

/**
 * 그룹 참여 페이지
 * - 그룹 코드 입력
 * - 그룹 참여 처리
 * - lockJoin 체크 (그룹 참여 제한 기능)
 */
export default function GroupJoinPage({ session, token, handleLogout }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [groupCode, setGroupCode] = useState("");
  const [error, setError] = useState("");

  // 그룹 참여 처리
  const handleJoinGroup = (e) => {
    e.preventDefault();
    setError("");

    if (!groupCode.trim()) {
      setError("그룹 코드를 입력해주세요.");
      return;
    }

    // 토큰을 사용하여 그룹에 참여
    const result = joinGroup(token, groupCode);

    if (result.success) {
      toast.success(`'${result.group.name}' 그룹에 참여했습니다! 🎉`);
      setTimeout(() => {
        navigate(routes.groupDetail.replace(":groupId", result.group.id));
      }, 1000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 p-2 bg-white/80 backdrop-blur-3xl rounded-none shadow-sm">
              <HeaderBar session={session} handleLogout={handleLogout} />
            </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-6 py-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            {/* 타이틀 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                그룹 참여하기
              </h1>
              <p className="text-gray-600 mt-2">
                친구에게 받은 그룹 코드를 입력하세요
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* 참여 폼 */}
            <form onSubmit={handleJoinGroup} className="space-y-6">
              <Input
                label="그룹 코드"
                type="text"
                value={groupCode}
                onChange={(value) => setGroupCode(value.toUpperCase())}
                placeholder="예: ABC123"
                required
              />

              <div className="bg-indigo-50 rounded-lg shadow-lg shadow-indigo-100 p-4">
                <p className="text-sm text-indigo-800">
                  💡 <strong>그룹 코드는 어디서 받나요?</strong>
                  <br />
                  그룹을 만든 친구에게 6자리 코드를 받으세요.
                  <br />
                  코드는 대소문자 구분 없이 입력 가능합니다.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="w-full"
              >
                그룹 참여하기
              </Button>
            </form>

            {/* 그룹 만들기 링크 */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                아직 그룹이 없으신가요?{" "}
                <button
                  onClick={() => navigate(routes.groupCreate)}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  새 그룹 만들기
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
