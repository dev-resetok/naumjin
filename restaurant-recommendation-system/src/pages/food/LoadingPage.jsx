import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import routes from "@utils/constants/routes";
import { getGroupById, updateGroup } from "@utils/helpers/storage";
import { generateMockRestaurants, sortRestaurantsByConsensus } from "@utils/helpers/foodRecommendation";
import { Loader2 } from "lucide-react";

/**
 * 로딩 페이지
 * - 식당 데이터 생성, 그룹 합의 점수 계산, 결과 저장
 */
export default function LoadingPage({ token }) {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("데이터 준비 중...");

  useEffect(() => {
    const processRecommendation = async () => {
      if (!token) {
        alert("인증 정보가 없습니다. 다시 로그인해주세요.");
        navigate(routes.login);
        return;
      }
      try {
        // 1. 그룹 정보 및 멤버 정보 로드 (10%)
        setProgress(10);
        setMessage("그룹 정보를 불러오는 중...");
        await sleep(500);

        const groupResult = getGroupById(token, groupId);
        if (!groupResult.success) {
          alert(groupResult.message);
          navigate(routes.groupDetail.replace(":groupId", groupId));
          return;
        }
        
        const group = groupResult.group;
        if (!group.tripPlan) {
          alert("여행 계획이 설정되지 않았습니다.");
          navigate(routes.groupDetail.replace(":groupId", groupId));
          return;
        }

        // 2. 멤버 선호도 분석 (30%)
        setProgress(30);
        setMessage("멤버들의 선호도를 분석하는 중...");
        await sleep(500);
        
        // getGroupById가 멤버 정보를 포함하므로, members를 바로 사용
        const members = group.members;
        const membersWithoutPreference = members.filter(m => !m.preference);
        if (membersWithoutPreference.length > 0) {
          alert(`일부 멤버가 선호도를 입력하지 않았습니다.\n(${membersWithoutPreference.map(m => m.nickname).join(", ")})`);
          navigate(routes.groupDetail.replace(":groupId", groupId));
          return;
        }

        // 3. 식당 데이터 생성 (50%)
        setProgress(50);
        setMessage(`${group.tripPlan.region} 지역의 식당을 검색하는 중...`);
        await sleep(800);

        const restaurants = generateMockRestaurants(30, group.tripPlan.region);

        // 4. 합의 점수 계산 (70%)
        setProgress(70);
        setMessage("그룹 합의 점수를 계산하는 중...");
        await sleep(800);

        const sortedRestaurants = sortRestaurantsByConsensus(restaurants, members);

        // 5. 결과 저장 (90%)
        setProgress(90);
        setMessage("추천 결과를 저장하는 중...");
        await sleep(500);

        const updateResult = updateGroup(token, groupId, {
          restaurants: sortedRestaurants,
          lastRecommendation: new Date().toISOString(),
        });

        if (!updateResult.success) {
          throw new Error("결과 저장 실패: " + updateResult.message);
        }

        // 6. 완료 (100%)
        setProgress(100);
        setMessage("완료! 추천 결과로 이동합니다...");
        await sleep(500);

        navigate(routes.foodResult.replace(":groupId", groupId));

      } catch (error) {
        console.error("추천 처리 중 오류:", error);
        alert("추천 처리 중 오류가 발생했습니다.");
        navigate(routes.groupDetail.replace(":groupId", groupId));
      }
    };

    processRecommendation();
  }, [groupId, token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        {/* 로딩 애니메이션 */}
        <div className="mb-8">
          <Loader2 className="w-20 h-20 text-indigo-600 animate-spin mx-auto" />
        </div>

        {/* 진행 상황 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI가 분석하는 중...</h1>
          <p className="text-lg text-gray-600">{message}</p>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-96 bg-white rounded-full h-4 border-2 border-indigo-300 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">{progress}%</p>

        {/* 팁 */}
        <div className="mt-10 max-w-md mx-auto bg-white rounded-xl p-6 border-2 border-indigo-200 shadow-lg">
          <p className="text-sm text-gray-700">
            💡 <strong>잠깐만요!</strong>
            <br />
            AI가 모든 멤버의 선호도를 분석하여 최적의 식당을 찾고 있습니다.
            <br />
            곧 완벽한 추천을 받을 수 있어요! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}

// 딜레이 함수
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
