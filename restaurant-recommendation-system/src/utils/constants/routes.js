/**
 * 애플리케이션의 모든 라우트 경로를 정의합니다.
 */
const routes = {
  // 인증
  login: "/login",
  register: "/register",

  // 메인
  home: "/",

  // 마이페이지
  mypage: "/mypage",
  mypageEdit: "/mypage/edit",

  // 온보딩 (개인 선호도 설정)
  onboardingPreference: "/onboarding/preference",

  // 그룹
  groupCreate: "/group/create",
  groupJoin: "/group/join",
  groupDetail: "/group/:groupId",
  groupManage: "/group/:groupId/manage",
  myGroups: "/my-groups",

  // 그룹 내 선호도 설정 (그룹 컨텍스트)
  groupFoodPreference: "/group/:groupId/preference",

  // 여행 계획
  tripPlan: "/group/:groupId/trip-plan",

  // 추천 프로세스
  loading: "/group/:groupId/loading/:dayIndex",
  foodResult: "/group/:groupId/food-result",
  foodDetail: "/group/:groupId/food/:restaurantId",

  // 최종 계획
  finalPlan: "/group/:groupId/final-plan",
};

export default routes;
