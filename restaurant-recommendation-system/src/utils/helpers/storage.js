/**
 * 로컬 스토리지 기반의 모의(Mock) 백엔드 API
 * 사용자 및 그룹 데이터를 관리하고, 토큰 기반 인증을 시뮬레이션합니다.
 */

// --- 내부 데이터베이스 및 키 ---

const STORAGE_KEYS = {
  CURRENT_SESSION: "currentUserSession", // 현재 로그인 세션 정보
  USERS: "users", // 모든 사용자 정보 (DB 역할)
  GROUPS: "groups", // 모든 그룹 정보 (DB 역할)
};

// --- 비공개 헬퍼 함수 (파일 내부에서만 사용) ---

/**
 * 'users' 테이블에서 모든 사용자 정보를 가져옵니다. (DB 읽기)
 * @returns {Array} 사용자 목록
 */
function _getAllUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

/**
 * 'users' 테이블에 사용자 목록을 저장합니다. (DB 쓰기)
 * @param {Array} users - 전체 사용자 목록
 */
function _setAllUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/**
 * 'groups' 테이블에서 모든 그룹 정보를 가져옵니다. (DB 읽기)
 * @returns {Array} 그룹 목록
 */
function _getAllGroups() {
  const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
  return data ? JSON.parse(data) : [];
}

/**
 * 'groups' 테이블에 그룹 목록을 저장합니다. (DB 쓰기)
 * @param {Array} groups - 전체 그룹 목록
 */
function _setAllGroups(groups) {
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
}

/**
 * 전달된 토큰이 유효한지 검증합니다.
 * @param {string} token - 검증할 세션 토큰
 * @returns {object|null} 토큰이 유효하면 세션 객체 반환, 아니면 null
 */
function _validateSession(token) {
  const session = getCurrentSession();
  if (session && session.token === token) {
    return session;
  }
  return null;
}

// --- 공개 API: 세션 관리 ---

/**
 * 현재 활성화된 세션 정보를 가져옵니다.
 * @returns {object|null} 현재 세션 객체 (e.g., { user, token }) 또는 null
 */
export function getCurrentSession() {
  const sessionData = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  return sessionData ? JSON.parse(sessionData) : null;
}

/**
 * 로그아웃 - 현재 세션을 삭제합니다.
 */
export function clearCurrentSession() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
}

// --- 공개 API: 사용자 인증 및 관리 ---

/**
 * 새 사용자를 'DB'에 등록합니다.
 * @param {string} userId
 * @param {string} password
 * @param {string} nickname
 * @returns {{success: boolean, message: string}}
 */
export function registerUser(userId, password, nickname) {
  const users = _getAllUsers();

  if (users.find((u) => u.id === userId)) {
    return { success: false, message: "이미 존재하는 아이디입니다." };
  }

  const newUser = {
    id: userId,
    password, // 실제 환경에서는 해싱하여 저장해야 합니다.
    nickname,
    pid: `PID_${Date.now()}`,
    createdAt: new Date().toISOString(),
    preference: null,
  };

  users.push(newUser);
  _setAllUsers(users);

  return { success: true, message: "회원가입이 완료되었습니다." };
}

/**
 * 로그인을 시도하고 성공 시 세션을 생성합니다.
 * @param {string} userId
 * @param {string} password
 * @returns {{success: boolean, session: object|null, message: string}}
 */
export function loginUser(userId, password) {
  const users = _getAllUsers();
  const user = users.find((u) => u.id === userId && u.password === password);

  if (user) {
    // 비밀번호를 제외한 사용자 정보만 추출
    const { password, ...userWithoutPassword } = user;

    // 새 세션 생성
    const token = `session_token_${Date.now()}_${Math.random()}`;
    const session = { user: userWithoutPassword, token };

    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));

    return { success: true, session, message: "로그인 성공" };
  }

  return {
    success: false,
    session: null,
    message: "아이디 또는 비밀번호가 일치하지 않습니다.",
  };
}

/**
 * 사용자 정보를 업데이트합니다. (본인만 가능)
 * @param {string} token - 인증 토큰
 * @param {object} updates - 업데이트할 정보
 * @returns {{success: boolean, user: object|null, message: string}}
 */
export function updateUser(token, updates) {
  const session = _validateSession(token);
  if (!session) {
    return {
      success: false,
      user: null,
      message: "인증 실패: 유효하지 않은 토큰입니다.",
    };
  }

  const users = _getAllUsers();
  const index = users.findIndex((u) => u.id === session.user.id);

  if (index !== -1) {
    // 비밀번호는 이 함수로 변경할 수 없도록 함
    delete updates.password;

    users[index] = { ...users[index], ...updates };
    _setAllUsers(users);

    // 현재 세션 정보도 업데이트
    const { password, ...updatedUserWithoutPassword } = users[index];
    const newSession = { ...session, user: updatedUserWithoutPassword };
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_SESSION,
      JSON.stringify(newSession)
    );

    return {
      success: true,
      user: updatedUserWithoutPassword,
      message: "사용자 정보가 업데이트되었습니다.",
    };
  }

  return { success: false, user: null, message: "사용자를 찾을 수 없습니다." };
}

// --- 공개 API: 그룹 관리 (보안 적용) ---

/**
 * 새 그룹을 생성합니다. (로그인한 사용자만 가능)
 * @param {string} token - 인증 토큰
 * @param {string} groupName - 생성할 그룹 이름
 * @returns {{success: boolean, group: object|null, message: string}}
 */
export function createGroup(token, groupName) {
  const session = _validateSession(token);
  if (!session) {
    return {
      success: false,
      group: null,
      message: "인증 실패: 그룹을 생성하려면 로그인이 필요합니다.",
    };
  }

  const groups = _getAllGroups();
  const creatorId = session.user.id;

  const newGroup = {
    id: `GRP_${Date.now()}`,
    name: groupName,
    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    creatorId,
    members: [creatorId],
    createdAt: new Date().toISOString(),
    tripPlan: null,
    restaurants: [],
    restaurantsByDay: null,
    history: [],
    preventReset: false, // 초기화 방지 기능 (기본: 비활성화)
    lockJoin: false, // 그룹 참여 제한 (기본: 비활성화)
  };

  groups.push(newGroup);
  _setAllGroups(groups);

  return { success: true, group: newGroup, message: "그룹이 생성되었습니다." };
}

/**
 * 그룹 코드로 그룹에 참여합니다. (로그인한 사용자만 가능)
 * @param {string} token - 인증 토큰
 * @param {string} groupCode - 참여할 그룹 코드
 * @returns {{success: boolean, group: object|null, message: string}}
 */
export function joinGroup(token, groupCode) {
  const session = _validateSession(token);
  if (!session) {
    return {
      success: false,
      group: null,
      message: "인증 실패: 그룹에 참여하려면 로그인이 필요합니다.",
    };
  }

  const groups = _getAllGroups();
  const group = groups.find(
    (g) => g.code.toUpperCase() === groupCode.toUpperCase()
  );

  if (!group) {
    return {
      success: false,
      group: null,
      message: "존재하지 않는 그룹 코드입니다.",
    };
  }

  // ✅ 그룹 참여 제한 체크
  if (group.lockJoin) {
    return {
      success: false,
      group: null,
      message: "이 그룹은 참여가 제한되어 있습니다. 그룹장에게 문의해주세요.",
    };
  }

  const userId = session.user.id;
  if (group.members.includes(userId)) {
    return {
      success: false,
      group: null,
      message: "이미 참여 중인 그룹입니다.",
    };
  }

  group.members.push(userId);

  // ✅ 초기화 방지 기능 체크
  if (!group.preventReset) {
    // 초기화 방지가 꺼져있으면 식당 추천 데이터 초기화
    group.restaurantsByDay = null;
    group.restaurants = null;
    group.lastRecommendation = null;

    // localStorage에 저장된 선택된 식당 데이터도 초기화
    const selectedRestaurantsKey = `selectedRestaurants_${group.id}`;
    localStorage.removeItem(selectedRestaurantsKey);

    console.log(
      "🔄 새 멤버 참여로 인한 식당 데이터 초기화 (localStorage 포함)"
    );
  } else {
    console.log("🛡️ 초기화 방지 활성화 - 식당 데이터 유지");
  }

  _setAllGroups(groups);

  return { success: true, group, message: "그룹에 참여했습니다." };
}

/**
 * 특정 그룹의 상세 정보를 가져옵니다. (그룹 멤버만 가능)
 * - 멤버 정보를 포함하여 반환합니다.
 * @param {string} token - 인증 토큰
 * @param {string} groupId - 조회할 그룹 ID
 * @returns {{success: boolean, group: object|null, message: string}}
 */
export function getGroupById(token, groupId) {
  const session = _validateSession(token);
  if (!session) {
    return {
      success: false,
      group: null,
      message: "인증 실패: 그룹 정보를 보려면 로그인이 필요합니다.",
    };
  }

  const group = _getAllGroups().find((g) => g.id === groupId);

  if (!group) {
    return { success: false, group: null, message: "그룹을 찾을 수 없습니다." };
  }

  // 권한 확인: 요청한 사용자가 그룹 멤버인지 확인
  if (!group.members.includes(session.user.id)) {
    return {
      success: false,
      group: null,
      message: "권한 없음: 이 그룹의 멤버가 아닙니다.",
    };
  }

  // --- 멤버 정보 채우기 ---
  const allUsers = _getAllUsers();
  const populatedMembers = group.members
    .map((memberId) => {
      const memberInfo = allUsers.find((u) => u.id === memberId);
      if (!memberInfo) return null;
      // 비밀번호를 제외한 공개 정보만 반환
      const { password, ...publicMemberInfo } = memberInfo;
      return publicMemberInfo;
    })
    .filter(Boolean); // null인 경우(사용자를 찾지 못한 경우) 제외

  const groupWithPopulatedMembers = { ...group, members: populatedMembers };
  // -------------------------

  return {
    success: true,
    group: groupWithPopulatedMembers,
    message: "그룹 정보를 성공적으로 가져왔습니다.",
  };
}

/**
 * 사용자가 속한 모든 그룹 목록을 가져옵니다. (로그인한 사용자만 가능)
 * @param {string} token - 인증 토큰
 * @returns {{success: boolean, groups: Array, message: string}}
 */
export function getUserGroups(token) {
  const session = _validateSession(token);
  if (!session) {
    return {
      success: false,
      groups: [],
      message: "인증 실패: 그룹 목록을 보려면 로그인이 필요합니다.",
    };
  }

  const allGroups = _getAllGroups();
  const userGroups = allGroups.filter((g) =>
    g.members.includes(session.user.id)
  );

  return {
    success: true,
    groups: userGroups,
    message: "사용자의 그룹 목록을 가져왔습니다.",
  };
}

/**
 * 그룹 정보를 업데이트합니다. (그룹 멤버만 가능, 기능에 따라 생성자만 가능하도록 제한할 수도 있음)
 * @param {string} token - 인증 토큰
 * @param {string} groupId - 업데이트할 그룹 ID
 * @param {object} updates - 업데이트할 정보
 * @returns {{success: boolean, group: object|null, message: string}}
 */
export function updateGroup(token, groupId, updates) {
  const session = _validateSession(token);
  if (!session) {
    return {
      success: false,
      group: null,
      message: "인증 실패: 그룹 정보를 수정하려면 로그인이 필요합니다.",
    };
  }

  const groups = _getAllGroups();
  const index = groups.findIndex((g) => g.id === groupId);

  if (index === -1) {
    return { success: false, group: null, message: "그룹을 찾을 수 없습니다." };
  }

  // 권한 확인: 요청한 사용자가 그룹 멤버인지 확인
  if (!groups[index].members.includes(session.user.id)) {
    return {
      success: false,
      group: null,
      message: "권한 없음: 이 그룹의 멤버가 아닙니다.",
    };
  }

  groups[index] = { ...groups[index], ...updates };
  _setAllGroups(groups);

  return {
    success: true,
    group: groups[index],
    message: "그룹 정보가 업데이트되었습니다.",
  };
}

/**
 * 그룹을 삭제합니다. (그룹 생성자만 가능)
 * @param {string} token - 인증 토큰
 * @param {string} groupId - 삭제할 그룹 ID
 * @returns {{success: boolean, message: string}}
 */
export function deleteGroup(token, groupId) {
  const session = _validateSession(token);
  if (!session) {
    return {
      success: false,
      message: "인증 실패: 그룹을 삭제하려면 로그인이 필요합니다.",
    };
  }

  const groups = _getAllGroups();
  const index = groups.findIndex((g) => g.id === groupId);

  if (index === -1) {
    return { success: false, message: "그룹을 찾을 수 없습니다." };
  }

  // 권한 확인: 요청한 사용자가 그룹 생성자인지 확인
  if (groups[index].creatorId !== session.user.id) {
    return {
      success: false,
      message: "권한 없음: 그룹 생성자만 삭제할 수 있습니다.",
    };
  }

  const filteredGroups = groups.filter((g) => g.id !== groupId);
  _setAllGroups(filteredGroups);

  return { success: true, message: "그룹이 삭제되었습니다." };
}

/**
 * 그룹에서 멤버를 내보냅니다. (그룹 생성자만 가능)
 * @param {string} token - 인증 토큰
 * @param {string} groupId - 그룹 ID
 * @param {string} userIdToRemove - 내보낼 사용자의 ID
 * @returns {{success: boolean, message: string}}
 */
export function removeUserFromGroup(token, groupId, userIdToRemove) {
  const session = _validateSession(token);
  if (!session) {
    return {
      success: false,
      message: "인증 실패: 멤버를 내보내려면 로그인이 필요합니다.",
    };
  }

  const groups = _getAllGroups();
  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    return { success: false, message: "그룹을 찾을 수 없습니다." };
  }

  // 권한 확인: 요청한 사용자가 그룹 생성자인지 확인
  if (group.creatorId !== session.user.id) {
    return {
      success: false,
      message: "권한 없음: 그룹 생성자만 멤버를 내보낼 수 있습니다.",
    };
  }

  // 생성자 자신은 내보낼 수 없음
  if (userIdToRemove === session.user.id) {
    return { success: false, message: "자기 자신을 내보낼 수 없습니다." };
  }

  const memberIndex = group.members.indexOf(userIdToRemove);
  if (memberIndex === -1) {
    return { success: false, message: "해당 사용자는 그룹 멤버가 아닙니다." };
  }

  group.members.splice(memberIndex, 1);

  // ✅ 초기화 방지 기능 체크
  if (!group.preventReset) {
    // 초기화 방지가 꺼져있으면 식당 추천 데이터 초기화
    group.restaurantsByDay = null;
    group.restaurants = null;
    group.lastRecommendation = null;

    // localStorage에 저장된 선택된 식당 데이터도 초기화
    const selectedRestaurantsKey = `selectedRestaurants_${groupId}`;
    localStorage.removeItem(selectedRestaurantsKey);

    console.log("🔄 멤버 변경으로 인한 식당 데이터 초기화 (localStorage 포함)");
  } else {
    console.log("🛡️ 초기화 방지 활성화 - 식당 데이터 유지");
  }

  _setAllGroups(groups);

  return { success: true, message: "멤버를 그룹에서 내보냈습니다." };
}

/**
 * 그룹에서 나갑니다. (일반 멤버만 가능)
 * @param {string} token - 인증 토큰
 * @param {string} groupId - 나갈 그룹 ID
 * @returns {{success: boolean, message: string}}
 */
export function leaveGroup(token, groupId) {
  const session = _validateSession(token);
  if (!session) {
    return {
      success: false,
      message: "인증 실패: 그룹에서 나가려면 로그인이 필요합니다.",
    };
  }

  const groups = _getAllGroups();
  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    return { success: false, message: "그룹을 찾을 수 없습니다." };
  }

  // 그룹 생성자는 나갈 수 없음 (삭제만 가능)
  if (group.creatorId === session.user.id) {
    return {
      success: false,
      message:
        "그룹 생성자는 그룹에서 나갈 수 없습니다. 대신 그룹 관리를 통해 그룹을 삭제해주세요.",
    };
  }

  const memberIndex = group.members.indexOf(session.user.id);
  if (memberIndex === -1) {
    return { success: false, message: "당신은 이 그룹의 멤버가 아닙니다." };
  }

  group.members.splice(memberIndex, 1);

  // ✅ 초기화 방지 기능 체크
  if (!group.preventReset) {
    // 초기화 방지가 꺼져있으면 식당 추천 데이터 초기화
    group.restaurantsByDay = null;
    group.restaurants = null;
    group.lastRecommendation = null;

    // localStorage에 저장된 선택된 식당 데이터도 초기화
    const selectedRestaurantsKey = `selectedRestaurants_${groupId}`;
    localStorage.removeItem(selectedRestaurantsKey);

    console.log("🔄 멤버 변경으로 인한 식당 데이터 초기화 (localStorage 포함)");
  } else {
    console.log("🛡️ 초기화 방지 활성화 - 식당 데이터 유지");
  }

  _setAllGroups(groups);

  return { success: true, message: "그룹에서 나왔습니다." };
}
