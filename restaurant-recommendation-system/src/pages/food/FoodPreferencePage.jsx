import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "@common/bar/HeaderBar";
import Button from "@common/button/Button";
import { RangeInput } from "@components/common/Input";
import routes from "@utils/constants/routes";
import { getCurrentUser, updateUser } from "@utils/helpers/storage";
import {
  FOOD_CATEGORIES,
  FOOD_KEYWORDS,
} from "@utils/helpers/foodRecommendation";
import { Heart, ThumbsDown } from "lucide-react";

/**
 * 음식 선호도 입력 페이지
 * - 좋아하는 음식 카테고리 선택 (선택 시 싫어하는 음식에서 자동 비활성화)
 * - 싫어하는 음식 카테고리 선택 (선택 시 좋아하는 음식에서 자동 비활성화)
 * - 좋아하는/피하고 싶은 맛/재료 선택 (상호 비활성화)
 * - 예산 범위 설정
 */
export default function FoodPreferencePage({ session, token, handleLogout }) {
  const navigate = useNavigate();

  // 선호도 state
  const [likedCategories, setLikedCategories] = useState([]);
  const [dislikedCategories, setDislikedCategories] = useState([]);
  const [dislikedKeywords, setDislikedKeywords] = useState([]);
  const [likedKeywords, setLikedKeywords] = useState([]);
  const [budgetRange, setBudgetRange] = useState([10000, 50000]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 로그인 체크 및 기존 선호도 로드
  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      alert("로그인이 필요합니다.");
      navigate(routes.login);
      return;
    }

    // 기존 선호도가 있으면 불러오기
    if (currentUser.preference) {
      const pref = currentUser.preference;
      setLikedCategories(pref.likedCategories || []);
      setDislikedCategories(pref.dislikedCategories || []);
      setDislikedKeywords(pref.dislikedKeywords || []);
      setLikedKeywords(pref.likedKeywords || []);
      setBudgetRange(pref.budgetRange || [10000, 50000]);
    }

    setIsLoaded(true);
  }, []); // 의존성 배열을 빈 배열로 변경

  // 좋아하는 카테고리 토글
  const handleLikedCategoryToggle = (category) => {
    setLikedCategories((prev) => {
      if (prev.includes(category)) {
        // 이미 선택된 경우 제거
        return prev.filter((c) => c !== category);
      } else {
        // 선택되지 않은 경우 추가
        return [...prev, category];
      }
    });

    // 싫어하는 카테고리에서 제거
    setDislikedCategories((prev) => prev.filter((c) => c !== category));
  };

  // 싫어하는 카테고리 토글
  const handleDislikedCategoryToggle = (category) => {
    setDislikedCategories((prev) => {
      if (prev.includes(category)) {
        // 이미 선택된 경우 제거
        return prev.filter((c) => c !== category);
      } else {
        // 선택되지 않은 경우 추가
        return [...prev, category];
      }
    });

    // 좋아하는 카테고리에서 제거
    setLikedCategories((prev) => prev.filter((c) => c !== category));
  };

  // 좋아하는 키워드 토글
  const handleLikedKeywordToggle = (keyword) => {
    setLikedKeywords((prev) => {
      if (prev.includes(keyword)) {
        return prev.filter((k) => k !== keyword);
      } else {
        return [...prev, keyword];
      }
    });

    setDislikedKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  // 싫어하는 키워드 토글
  const handleDislikedKeywordToggle = (keyword) => {
    setDislikedKeywords((prev) => {
      if (prev.includes(keyword)) {
        return prev.filter((k) => k !== keyword);
      } else {
        return [...prev, keyword];
      }
    });

    setLikedKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  // 선호도 저장
  const handleSavePreference = (e) => {
    e.preventDefault();

    const preference = {
      likedCategories,
      dislikedCategories,
      dislikedKeywords,
      likedKeywords,
      budgetRange,
      updatedAt: new Date().toISOString(),
    };

    const result = updateUser(token, { preference });

    if (result.success) {
      alert("선호도가 저장되었습니다!");
      // 마이페이지로 이동
      navigate(routes.mypage);
    } else {
      alert("저장에 실패했습니다.");
    }
  };

  const currentUser = getCurrentUser();

  if (!currentUser || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  const categories = Object.values(FOOD_CATEGORIES);
  const keywords = Object.values(FOOD_KEYWORDS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* 헤더 */}
      <header className="p-5 bg-indigo-100 border-b-3 border-indigo-300 rounded-b-2xl shadow-sm">
        <HeaderBar session={session} handleLogout={handleLogout} />
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
            {/* 타이틀 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                음식 선호도 {currentUser.preference ? "수정" : "입력"}
              </h1>
              <p className="text-gray-600">
                {currentUser.nickname}님의 음식 취향을 알려주세요
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => {
                    const isSelected = likedCategories.includes(category);
                    const isDisabled = dislikedCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleLikedCategoryToggle(category)}
                        disabled={isDisabled}
                        className={`
                          px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium
                          ${
                            isSelected
                              ? "bg-green-100 border-green-500 text-green-700"
                              : isDisabled
                              ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                              : "bg-white border-gray-300 text-gray-700 hover:border-green-300 cursor-pointer"
                          }
                        `}
                      >
                        {isSelected && "✓ "}
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 싫어하는 음식 카테고리 */}
              <div className="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsDown className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    선호하지 않는 음식 종류
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => {
                    const isSelected = dislikedCategories.includes(category);
                    const isDisabled = likedCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleDislikedCategoryToggle(category)}
                        disabled={isDisabled}
                        className={`
                          px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium
                          ${
                            isSelected
                              ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                              : isDisabled
                              ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                              : "bg-white border-gray-300 text-gray-700 hover:border-yellow-300 cursor-pointer"
                          }
                        `}
                      >
                        {isSelected && "✓ "}
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 피하고 싶은 키워드 */}
              <div className="p-6 bg-orange-50 rounded-lg border-2 border-orange-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  피하고 싶은 맛/재료
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {keywords.map((keyword) => {
                    const isSelected = dislikedKeywords.includes(keyword);
                    const isDisabled = likedKeywords.includes(keyword);
                    return (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => handleDislikedKeywordToggle(keyword)}
                        disabled={isDisabled}
                        className={`
                          px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium
                          ${
                            isSelected
                              ? "bg-orange-100 border-orange-500 text-orange-700"
                              : isDisabled
                              ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                              : "bg-white border-gray-300 text-gray-700 hover:border-orange-300 cursor-pointer"
                          }
                        `}
                      >
                        {isSelected && "✓ "}
                        {keyword}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 좋아하는 키워드 */}
              <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  선호하는 맛/재료
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {keywords.map((keyword) => {
                    const isSelected = likedKeywords.includes(keyword);
                    const isDisabled = dislikedKeywords.includes(keyword);
                    return (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => handleLikedKeywordToggle(keyword)}
                        disabled={isDisabled}
                        className={`
                          px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium
                          ${
                            isSelected
                              ? "bg-blue-100 border-blue-500 text-blue-700"
                              : isDisabled
                              ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                              : "bg-white border-gray-300 text-gray-700 hover:border-blue-300 cursor-pointer"
                          }
                        `}
                      >
                        {isSelected && "✓ "}
                        {keyword}
                      </button>
                    );
                  })}
                </div>
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
                  • 그룹 여행 시 모든 멤버의 선호도를 종합하여 최적의 식당을
                  추천합니다
                  <br />• 좋아하는 음식과 싫어하는 음식은 동시에 선택할 수
                  없습니다
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  type="button"
                  onClick={() => navigate(routes.mypage)}
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
                  저장하기
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
