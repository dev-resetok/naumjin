import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderBar from "@common/bar/HeaderBar";
import Button from "@common/button/Button";
import { CheckboxGroup, RangeInput } from "@components/common/Input";
import routes from "@utils/constants/routes";
import { getCurrentUser, getGroupById, updateUser } from "@utils/helpers/storage";
import { FOOD_CATEGORIES, FOOD_KEYWORDS } from "@utils/helpers/foodRecommendation";
import { Heart, ThumbsDown, X } from "lucide-react";

/**
 * 음식 선호도 입력 페이지
 * - 좋아하는 음식 카테고리 선택
 * - 싫어하는 음식 카테고리 선택
 * - 못 먹는 음식 키워드 선택
 * - 예산 범위 설정
 */
export default function FoodPreferencePage() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const currentUser = getCurrentUser();
  const [group, setGroup] = useState(null);

  // 선호도 state
  const [likedCategories, setLikedCategories] = useState([]);
  const [dislikedCategories, setDislikedCategories] = useState([]);
  const [cannotEat, setCannotEat] = useState([]);
  const [dislikedKeywords, setDislikedKeywords] = useState([]);
  const [likedKeywords, setLikedKeywords] = useState([]);
  const [budgetRange, setBudgetRange] = useState([10000, 50000]);

  // 로그인 및 그룹 체크
  useEffect(() => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      navigate(routes.login);
      return;
    }

    const groupData = getGroupById(groupId);
    if (!groupData) {
      alert("존재하지 않는 그룹입니다.");
      navigate(routes.home);
      return;
    }

    setGroup(groupData);

    // 기존 선호도가 있으면 불러오기
    if (currentUser.preference) {
      const pref = currentUser.preference;
      setLikedCategories(pref.likedCategories || []);
      setDislikedCategories(pref.dislikedCategories || []);
      setCannotEat(pref.cannotEat || []);
      setDislikedKeywords(pref.dislikedKeywords || []);
      setLikedKeywords(pref.likedKeywords || []);
      setBudgetRange(pref.budgetRange || [10000, 50000]);
    }
  }, [groupId, currentUser, navigate]);

  // 선호도 저장
  const handleSavePreference = (e) => {
    e.preventDefault();

    const preference = {
      likedCategories,
      dislikedCategories,
      cannotEat,
      dislikedKeywords,
      likedKeywords,
      budgetRange,
      updatedAt: new Date().toISOString(),
    };

    const result = updateUser(currentUser.id, { preference });

    if (result.success) {
      alert("선호도가 저장되었습니다!");
      navigate(routes.loading.replace(":groupId", groupId));
    } else {
      alert("저장에 실패했습니다.");
    }
  };

  if (!group) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  const categories = Object.values(FOOD_CATEGORIES);
  const keywords = Object.values(FOOD_KEYWORDS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* 헤더 */}
      <header className="p-5 bg-indigo-100 border-b-3 border-indigo-300 rounded-b-2xl shadow-sm">
        <HeaderBar />
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
            {/* 타이틀 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">음식 선호도 입력</h1>
              <p className="text-gray-600">
                {currentUser.nickname}님의 음식 취향을 알려주세요
              </p>
              <p className="text-sm text-indigo-600 mt-1">
                그룹: {group.name}
              </p>
            </div>

            {/* 선호도 폼 */}
            <form onSubmit={handleSavePreference} className="space-y-8">
              {/* 좋아하는 음식 카테고리 */}
              <div className="p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    좋아하는 음식 종류
                  </h2>
                </div>
                <CheckboxGroup
                  options={categories}
                  selected={likedCategories}
                  onChange={setLikedCategories}
                />
              </div>

              {/* 싫어하는 음식 카테고리 */}
              <div className="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsDown className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    선호하지 않는 음식 종류
                  </h2>
                </div>
                <CheckboxGroup
                  options={categories}
                  selected={dislikedCategories}
                  onChange={setDislikedCategories}
                />
              </div>

              {/* 못 먹는 음식 (알레르기 등) */}
              <div className="p-6 bg-red-50 rounded-lg border-2 border-red-200">
                <div className="flex items-center gap-2 mb-4">
                  <X className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    못 먹는 음식 (알레르기, 금기 등)
                  </h2>
                </div>
                <CheckboxGroup
                  options={keywords}
                  selected={cannotEat}
                  onChange={setCannotEat}
                />
                <p className="text-sm text-red-600 mt-3">
                  ⚠️ 이 항목은 추천에서 완전히 제외됩니다
                </p>
              </div>

              {/* 싫어하는 키워드 */}
              <div className="p-6 bg-orange-50 rounded-lg border-2 border-orange-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  피하고 싶은 맛/재료
                </h2>
                <CheckboxGroup
                  options={keywords}
                  selected={dislikedKeywords}
                  onChange={setDislikedKeywords}
                />
              </div>

              {/* 좋아하는 키워드 */}
              <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  선호하는 맛/재료
                </h2>
                <CheckboxGroup
                  options={keywords}
                  selected={likedKeywords}
                  onChange={setLikedKeywords}
                />
              </div>

              {/* 예산 범위 */}
              <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                <RangeInput
                  label="💰 선호하는 가격대 (1인 평균)"
                  min={5000}
                  max={100000}
                  value={budgetRange}
                  onChange={setBudgetRange}
                  step={5000}
                />
              </div>

              {/* 안내 메시지 */}
              <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                <p className="text-sm text-indigo-800">
                  💡 <strong>알려드립니다:</strong>
                  <br />
                  • 선호도는 언제든 마이페이지에서 수정할 수 있습니다
                  <br />
                  • 모든 멤버의 선호도를 종합하여 최적의 식당을 추천합니다
                  <br />
                  • 못 먹는 음식이 있는 경우 반드시 체크해주세요!
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  type="button"
                  onClick={() => navigate(routes.groupDetail.replace(":groupId", groupId))}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  className="flex-1"
                >
                  저장 및 추천 받기
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
