import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import HeaderBar from "@common/bar/HeaderBar";
import Button from "@common/button/Button";
import routes from "@utils/constants/routes";
import { MapPin, Star, Users, ExternalLink } from "lucide-react";

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

// price_level(0-4)을 달러 기호로 변환
const renderPriceLevel = (priceLevel) => {
  if (typeof priceLevel !== 'number' || priceLevel < 1) {
    return <span className="text-gray-500">정보 없음</span>;
  }
  return (
    <span className="text-green-600 font-bold">
      {'$'.repeat(priceLevel)}
      <span className="text-gray-400 font-normal">
        {'$'.repeat(4 - priceLevel)}
      </span>
    </span>
  );
};

/**
 * 식당 상세 정보 페이지 (Google Places 데이터 기반)
 */
export default function FoodDetailPage({ session, handleLogout }) {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const location = useLocation();
  
  // FoodResultPage에서 navigate state로 전달받은 식당 정보
  const { restaurant } = location.state || {};

  // 데이터가 없는 경우 (직접 URL로 접근 등)
  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
        <h1 className="text-2xl font-bold text-red-700 mb-4">식당 정보를 찾을 수 없습니다</h1>
        <p className="text-gray-600">결과 목록 페이지에서 식당을 다시 선택해주세요.</p>
        <Button onClick={() => navigate(routes.foodResult.replace(':groupId', groupId))} className="mt-6">
          결과 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  // Google 지도에서 해당 장소로 바로 가는 URL 생성
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}&query_place_id=${restaurant.place_id}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-5 bg-indigo-100 border-b-3 border-indigo-300 rounded-b-2xl shadow-sm">
        <HeaderBar session={session} handleLogout={handleLogout} />
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 식당 기본 정보 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-indigo-200 shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* 왼쪽: 이미지 */}
              <div>
                <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                   <img 
                      src={restaurant.images[0]} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                </div>
              </div>

              {/* 오른쪽: 정보 */}
              <div className="flex flex-col justify-center">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-medium text-sm">
                    {restaurant.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                    {restaurant.name}
                  </h1>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-lg text-gray-700">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{restaurant.rating}</span>
                    <span className="text-gray-500 text-base">
                      ({restaurant.user_ratings_total || 0}개의 평가)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-lg text-gray-700">
                    <span className="font-bold w-6 text-center">💰</span>
                    <span>가격대: {renderPriceLevel(restaurant.avgPrice)}</span>
                  </div>
                  <div className="flex items-start gap-3 text-lg text-gray-700">
                    <MapPin className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    <span>{restaurant.location?.address}</span>
                  </div>
                </div>

                <div className="mt-6">
                   <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Google 지도에서 보기
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* 키워드/타입 정보 */}
          {restaurant.keywords && restaurant.keywords.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-lg mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">장소 유형</h2>
                <div className="flex flex-wrap gap-2">
                {restaurant.keywords.map((keyword, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 지도 (간단한 위치 표시) */}
          <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">위치 정보</h2>
            <div className="h-80 bg-gray-200 rounded-lg">
              {/* 정적 이미지 대신 실제 지도를 보여주는 것이 좋지만, 
                  API 키와 로딩 관리가 필요하므로 여기서는 간단히 처리 */}
              <iframe
                title="Restaurant Location"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '0.5rem' }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(restaurant.name)}&center=${restaurant.location.lat},${restaurant.location.lng}&zoom=15`}>
              </iframe>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(routes.foodResult.replace(":groupId", groupId))}
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}