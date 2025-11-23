/**
 * 로컬 스토리지 관리 헬퍼 함수
 * 사용자 정보, 그룹 정보 등을 브라우저에 저장/불러오기
 */

const STORAGE_KEYS = {
  CURRENT_USER: "currentUser",
  USERS: "users",
  GROUPS: "groups",
};

/**
 * 현재 로그인한 사용자 정보 저장
 */
export function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

/**
 * 로그아웃 - 현재 사용자 정보 삭제
 */
export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * 모든 사용자 정보 가져오기
 */
export function getAllUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

/**
 * 새 사용자 등록
 */
export function registerUser(userId, password, nickname) {
  const users = getAllUsers();
  
  // 중복 체크
  if (users.find(u => u.id === userId)) {
    return { success: false, message: "이미 존재하는 아이디입니다." };
  }

  const newUser = {
    id: userId,
    password,
    nickname,
    pid: `PID_${Date.now()}`, // 고유 번호 생성
    createdAt: new Date().toISOString(),
    preference: null, // 초기에는 선호도 없음
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  return { success: true, user: newUser };
}

/**
 * 로그인 시도
 */
export function loginUser(userId, password) {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId && u.password === password);
  
  if (user) {
    setCurrentUser(user);
    return { success: true, user };
  }
  
  return { success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." };
}

/**
 * 사용자 정보 업데이트
 */
export function updateUser(userId, updates) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // 현재 사용자라면 현재 사용자 정보도 업데이트
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(users[index]);
    }
    
    return { success: true, user: users[index] };
  }
  
  return { success: false, message: "사용자를 찾을 수 없습니다." };
}

/**
 * 모든 그룹 정보 가져오기
 */
export function getAllGroups() {
  const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
  return data ? JSON.parse(data) : [];
}

/**
 * 특정 그룹 정보 가져오기
 */
export function getGroupById(groupId) {
  const groups = getAllGroups();
  return groups.find(g => g.id === groupId);
}

/**
 * 새 그룹 생성
 */
export function createGroup(groupName, creatorId) {
  const groups = getAllGroups();
  
  const newGroup = {
    id: `GRP_${Date.now()}`,
    name: groupName,
    code: Math.random().toString(36).substring(2, 8).toUpperCase(), // 6자리 랜덤 코드
    creatorId,
    members: [creatorId], // 생성자는 자동으로 멤버
    createdAt: new Date().toISOString(),
    tripPlan: null, // 여행 계획
    restaurants: [], // 추천된 식당 목록
    history: [], // 히스토리
  };

  groups.push(newGroup);
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  
  return { success: true, group: newGroup };
}

/**
 * 그룹 코드로 그룹 찾기
 */
export function findGroupByCode(code) {
  const groups = getAllGroups();
  return groups.find(g => g.code.toUpperCase() === code.toUpperCase());
}

/**
 * 그룹에 멤버 추가
 */
export function joinGroup(groupCode, userId) {
  const groups = getAllGroups();
  const group = groups.find(g => g.code.toUpperCase() === groupCode.toUpperCase());
  
  if (!group) {
    return { success: false, message: "존재하지 않는 그룹 코드입니다." };
  }
  
  if (group.members.includes(userId)) {
    return { success: false, message: "이미 참여 중인 그룹입니다." };
  }
  
  group.members.push(userId);
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  
  return { success: true, group };
}

/**
 * 그룹 정보 업데이트
 */
export function updateGroup(groupId, updates) {
  const groups = getAllGroups();
  const index = groups.findIndex(g => g.id === groupId);
  
  if (index !== -1) {
    groups[index] = { ...groups[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    return { success: true, group: groups[index] };
  }
  
  return { success: false, message: "그룹을 찾을 수 없습니다." };
}

/**
 * 사용자가 속한 그룹 목록 가져오기
 */
export function getUserGroups(userId) {
  const groups = getAllGroups();
  return groups.filter(g => g.members.includes(userId));
}
