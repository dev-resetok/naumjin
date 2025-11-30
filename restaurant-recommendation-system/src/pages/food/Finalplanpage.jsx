import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderBar from "@common/bar/HeaderBar";
import Button from "@common/button/Button";
import { InfoCard } from "@components/common/card/Card";
import routes from "@utils/constants/routes";
import { getGroupById } from "@utils/helpers/storage";
import {
  Calendar,
  MapPin,
  Star,
  Utensils,
  ArrowLeft,
  Edit,
  ExternalLink,
  Phone,
} from "lucide-react";

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

/**
 * 최종 여행 계획 페이지
 * - 각 날짜별로 선택된 식당 표시
 * - 지도 링크, 전화번호 등 유용한 정보 제공
 */
export default function FinalPlanPage({ session, token, handleLogout }) {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [selectedRestaurants, setSelectedRestaurants] = useState({});
  const [tripDays, setTripDays] = useState([]);

  const selectedRestaurantsKey = `selectedRestaurants_${groupId}`;

  useEffect(() => {
    if (token) {
      const result = getGroupById(token, groupId);
      if (result.success) {
        const groupData = result.group;
        setGroup(groupData);
        setTripDays(groupData.tripPlan?.days || []);

        console.log("🎯 FinalPlanPage 로드");
        console.log("여행 일수:", groupData.tripPlan?.days?.length);

        // localStorage에서 선택된 식당 로드
        const saved = localStorage.getItem(selectedRestaurantsKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log("💾 localStorage에서 로드:", parsed);
          setSelectedRestaurants(parsed);

          // 모든 날짜가 선택되었는지 확인
          const totalDays = groupData.tripPlan?.days?.length || 0;
          const selectedDaysCount = Object.keys(parsed).length;

          console.log(
            `📊 전체 ${totalDays}일 중 ${selectedDaysCount}일 선택됨`
          );

          if (selectedDaysCount < totalDays) {
            const missingDays = [];
            for (let i = 0; i < totalDays; i++) {
              if (!parsed[i]) {
                missingDays.push(i + 1);
              }
            }
            alert(
              `아직 모든 날짜의 식당을 선택하지 않았습니다.\n선택되지 않은 날짜: ${missingDays.join(
                ", "
              )}일차`
            );
            navigate(routes.foodResult.replace(":groupId", groupId));
          }
        } else {
          console.log("❌ 선택된 식당 없음");
          alert("선택된 식당이 없습니다.");
          navigate(routes.foodResult.replace(":groupId", groupId));
        }
      } else {
        alert(result.message);
        navigate(routes.home);
      }
    }
  }, [groupId, token, navigate, selectedRestaurantsKey]);

  // 구글 맵에서 보기
  const handleViewOnMap = (restaurant) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      restaurant.name
    )}&query_place_id=${restaurant.place_id}`;
    window.open(url, "_blank");
  };

  // 식당 재선택
  const handleEditRestaurants = () => {
    navigate(routes.foodResult.replace(":groupId", groupId));
  };

  if (!group || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  const totalDays = tripDays.length;
  const selectedDays = Object.keys(selectedRestaurants).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <header className="p-5 bg-indigo-100 border-b-3 border-indigo-300 rounded-b-2xl shadow-sm">
        <HeaderBar session={session} handleLogout={handleLogout} />
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              ✅ 최종 여행 계획
            </h1>
            <p className="text-gray-600">
              {group.name} · {tripDays[0]?.description || "여행"} · {totalDays}
              일 일정
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleEditRestaurants}>
              <Edit className="w-5 h-5" />
              식당 다시 선택
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                navigate(routes.groupDetail.replace(":groupId", groupId))
              }
            >
              <ArrowLeft className="w-5 h-5" />
              그룹으로 돌아가기
            </Button>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <InfoCard
            title="여행 기간"
            value={`${totalDays}일`}
            icon={<Calendar />}
            color="indigo"
          />
          <InfoCard
            title="선택 완료"
            value={`${selectedDays}개 식당`}
            icon={<Utensils />}
            color="green"
          />
          <InfoCard
            title="그룹 멤버"
            value={`${group.members.length}명`}
            icon={<MapPin />}
            color="purple"
          />
          <InfoCard
            title="평균 별점"
            value={
              Object.values(selectedRestaurants).length > 0
                ? (
                    Object.values(selectedRestaurants).reduce(
                      (sum, r) => sum + (r.rating || 0),
                      0
                    ) / Object.values(selectedRestaurants).length
                  ).toFixed(1)
                : "0"
            }
            icon={<Star />}
            color="orange"
          />
        </div>

        {/* 일정별 식당 */}
        <div className="space-y-6">
          {tripDays.map((day, index) => {
            const restaurant = selectedRestaurants[index];

            if (!restaurant) return null;

            let photoUrl = "https://via.placeholder.com/400x300?text=No+Image";
            if (restaurant.images && restaurant.images[0]) {
              photoUrl = restaurant.images[0];
            }

            return (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-lg"
              >
                {/* 날짜 헤더 */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6" />
                      <div>
                        <h2 className="text-2xl font-bold">{index + 1}일차</h2>
                        <p className="text-indigo-100 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {day.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-300" />
                      <span className="text-xl font-bold">
                        {restaurant.rating || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 식당 정보 */}
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* 이미지 */}
                    <div className="md:col-span-1">
                      <img
                        src={photoUrl}
                        alt={restaurant.name}
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>

                    {/* 정보 */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {restaurant.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                            {restaurant.category || "음식점"}
                          </span>
                          {restaurant.rating && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {restaurant.rating} (
                              {restaurant.user_ratings_total || 0}개 리뷰)
                            </span>
                          )}
                          {restaurant.avgPrice !== undefined && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              {"₩".repeat(restaurant.avgPrice || 1)}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 flex items-start gap-2">
                          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-600" />
                          <span>
                            {restaurant.location?.address || "주소 정보 없음"}
                          </span>
                        </p>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-3">
                        <Button
                          variant="primary"
                          onClick={() => handleViewOnMap(restaurant)}
                          className="flex-1"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Google Maps에서 보기
                        </Button>

                        {restaurant.location?.lat &&
                          restaurant.location?.lng && (
                            <Button
                              variant="secondary"
                              onClick={() => {
                                const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.location.lat},${restaurant.location.lng}`;
                                window.open(url, "_blank");
                              }}
                            >
                              길찾기
                            </Button>
                          )}
                      </div>

                      {/* 키워드 */}
                      {restaurant.keywords &&
                        restaurant.keywords.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              태그
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {restaurant.keywords
                                .slice(0, 5)
                                .map((keyword, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
          <h3 className="font-bold text-gray-800 mb-3">💡 여행 팁</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>
              • 각 식당을 클릭하여 Google Maps에서 자세한 정보를 확인하세요
            </li>
            <li>• 영업시간과 예약 가능 여부를 사전에 확인하는 것이 좋습니다</li>
            <li>
              • 이 계획은 브라우저에 저장되어 있어 언제든 다시 볼 수 있습니다
            </li>
            <li>• 식당을 변경하고 싶다면 "식당 다시 선택" 버튼을 클릭하세요</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
