import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "@common/bar/HeaderBar";
import Button from "@common/button/Button";
import routes from "@utils/constants/routes";
import { Users, MapPin, Sparkles, TrendingUp } from "lucide-react";

/**
 * 메인 페이지 (스크롤 애니메이션)
 * - 서비스 소개
 * - 로그인/회원가입 유도
 * - 로그인 후: 그룹 생성/참여 버튼
 * - 스크롤 시 섹션별 슬라이드 효과
 */
export default function MainPage({ session, handleLogout }) {
  const navigate = useNavigate();
  // 하나의 섹션으로 통합했으므로 sectionsRef.current[0]만 사용합니다.
  const sectionsRef = useRef([]);

  // 기능 소개 카드 데이터
  const features = [
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "그룹 여행 계획",
      description:
        "친구들과 함께 여행 그룹을 만들고 모두의 선호도를 반영한 식당을 찾아보세요.",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      title: "선호도 기반 추천",
      description:
        "각 멤버의 음식 선호도를 분석하여 모두가 만족할 수 있는 식당을 추천합니다.",
    },
    {
      icon: <MapPin className="w-8 h-8 text-green-600" />,
      title: "지역 기반 검색",
      description:
        "여행지와 일정에 맞춰 주변 식당을 찾고 합리적인 선택을 할 수 있습니다.",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "맞춤 식당 추천",
      description:
        "각 멤버가 입력한 좋아하는/싫어하는 음식 종류를 반영해 모두가 만족할 확률이 높은 식당을 맞춤 합의 점수로 계산해 순위로 보여줍니다.",
    },
  ];

  // 사용 방법 카드 데이터 (추가)
  const steps = [
    {
      number: 1,
      title: "회원가입 및 그룹 생성",
      description:
        "계정을 만들고 여행 그룹을 생성하세요. 친구들을 초대할 수 있는 코드가 발급됩니다.",
      colorClass: "bg-indigo-600",
    },
    {
      number: 2,
      title: "음식 선호도 입력",
      description: "각 멤버가 좋아하는 음식, 싫어하는 음식을 입력합니다.",
      colorClass: "bg-purple-600",
    },
    {
      number: 3,
      title: "맞춤 식당 추천 받기",
      description:
        "분석한 결과를 바탕으로 모두가 만족할 식당 목록을 확인하세요.",
      colorClass: "bg-green-600",
    },
  ];

  // Intersection Observer로 스크롤 애니메이션
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-in");
            // 한 번 애니메이션 실행 후 unobserve (선택 사항)
            // observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .section-hidden {
          opacity: 0;
          transform: translateY(50px);
        }

        .animate-slide-in {
          animation: slideIn 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        /* 전체 화면 섹션 스타일 수정: min-height 제거 및 패딩 강화 */
        .fullscreen-section {
          /* min-height: 85vh; // 불필요한 공백 방지를 위해 제거 또는 auto로 변경 */
          min-height: auto; 
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 6rem 2rem; /* 상하 패딩 증가 */
          padding-top: 10rem; /* 헤더를 고려하여 히어로 섹션 상단 패딩 추가 */
        }
        
        /* 히어로 섹션은 화면 중앙에 배치 유지 */
        #hero-section {
            min-height: 85vh;
        }

        /* 카드 호버 효과 강화 */
        .feature-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.1), 
                      0 10px 10px -5px rgba(79, 70, 229, 0.04);
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .feature-icon {
          transition: transform 0.3s ease;
        }

        /* 단계 카드 효과 */
        .step-card {
          transition: all 0.3s ease;
        }

        .step-card:hover {
          transform: translateY(-5px);
        }

        .step-number {
          transition: all 0.3s ease;
        }

        .step-card:hover .step-number {
          transform: scale(1.1) rotate(360deg);
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
        }

        /* 버튼 펄스 효과 */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
          }
          50% {
            box-shadow: 0 0 20px 10px rgba(79, 70, 229, 0);
          }
        }

        .cta-button {
          animation: pulse-glow 2s infinite;
        }
      `}</style>

      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 p-2 bg-white/80 backdrop-blur-3xl shadow-sm">
        <HeaderBar session={session} handleLogout={handleLogout} />
      </header>

      {/* 메인 콘텐츠 */}
      <main>
        {/* 히어로 섹션 - 전체 화면 */}
        {/* 헤더 때문에 min-height: 85vh를 유지하여 중앙 배치 효과를 줍니다. */}
        <div id="hero-section" className="fullscreen-section">
          <div className="text-center max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              함께하는 여행, 함께 찾는 맛집
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              그룹 멤버 모두가 만족하는 식당을 추천해드립니다
            </p>

            {/* 로그인 여부에 따른 버튼 */}
            {session ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate(routes.groupCreate)}
                    className="cta-button"
                  >
                    새 그룹 만들기
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate(routes.groupJoin)}
                  >
                    그룹 참여하기
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate(routes.myGroups)}
                  className="flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />내 그룹 보기
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(routes.register)}
                  className="cta-button"
                >
                  시작하기
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate(routes.login)}
                >
                  로그인
                </Button>
              </div>
            )}

            {/* 스크롤 안내 */}
            <div className="mt-16 animate-bounce">
              <svg
                className="w-6 h-6 mx-auto text-indigo-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
              <p className="text-sm text-gray-500 mt-2">아래로 스크롤하세요</p>
            </div>
          </div>
        </div>

        {/* 기능 소개 및 사용 방법 통합 섹션 */}
        <div
          id="features-and-steps-section"
          ref={(el) => (sectionsRef.current[0] = el)}
          className="fullscreen-section section-hidden pt-20 pb-24" /* 상하 패딩 추가 */
        >
          <div className="container mx-auto px-6 max-w-6xl">
            {/* 1. 기능 소개 (이전 sectionsRef.current[0] 내용) */}
            <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
              핵심 기능 ✨
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card bg-white rounded-2xl p-6 shadow-xl border-2 border-indigo-200 hover:border-indigo-400 transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="feature-icon mb-4 bg-indigo-100 p-3 rounded-full inline-block">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-base text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <hr className="my-16 border-t-2 border-indigo-100" />

            {/* 2. 사용 방법 안내 (이전 sectionsRef.current[1] 내용) */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-10 md:p-16 shadow-2xl">
              <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
                간단한 사용 방법 🚀
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {steps.map((step) => (
                  <div key={step.number} className="step-card text-center p-4">
                    <div
                      className={`step-number w-16 h-16 ${step.colorClass} text-white rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-6 shadow-lg`}
                    >
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA 버튼 */}
              <div className="mt-16 text-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    navigate(session ? routes.groupCreate : routes.register)
                  }
                  className="cta-button"
                >
                  {session ? "지금 시작하기" : "회원가입하고 시작하기"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
