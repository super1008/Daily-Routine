import { useEffect, useState } from 'react';
import { addDays, toISODate } from './dateUtils.js';

const STORAGE_KEY = 'daily-routine-state-v1';

function seedData() {
  const today = new Date();
  const iso = (offset) => toISODate(addDays(today, offset));

  return {
    habits: [
      { id: 'h1', name: '아침 스트레칭', meta: '오전 7:00', freq: 'daily', startDate: iso(-30) },
      { id: 'h2', name: '30분 독서', meta: '취침 전', freq: 'daily', startDate: iso(-30) },
      { id: 'h3', name: '물 8잔', meta: '하루 종일', freq: 'daily', startDate: iso(-30) },
      { id: 'h4', name: '코드 리뷰 1건', meta: '업무 시간', freq: 'daily', startDate: iso(-30) },
      { id: 'h5', name: '저녁 산책', meta: '오후 7:30', freq: 'weekly', startDow: 1, startDate: iso(-30) },
    ],
    habitHistory: {
      [iso(-1)]: ['h1', 'h2', 'h4'],
      [iso(-2)]: ['h1', 'h2', 'h3', 'h4'],
      [iso(-3)]: ['h1', 'h4'],
      [iso(-4)]: ['h1', 'h2', 'h3', 'h4'],
      [iso(-5)]: ['h1', 'h2', 'h3', 'h4', 'h5'],
      [iso(-6)]: ['h1', 'h4', 'h5'],
      [iso(-7)]: ['h1', 'h2', 'h3'],
    },
    goals: [
      { id: 'g1', name: '온보딩 화면 3개 배포', note: '가입 완료율 실험을 위한 신규 화면. 디자인 QA까지 포함해서 마감.', pct: 68, due: iso(3) },
      { id: 'g2', name: '디자인 시스템 문서 10개', note: '핵심 컴포넌트 우선. 토큰 정의는 완료됨.', pct: 40, due: iso(5) },
      { id: 'g3', name: '채용 최종 면접 2건', note: '이번 주 안에 일정 확정하고 피드백 정리.', pct: 75, due: iso(1) },
    ],
    diaryEntries: {
      [iso(-1)]: { mood: '뿌듯', text: '온보딩 세 번째 화면을 넘겼다. 오전에 스트레칭을 먼저 하니 회의 전까지 흐름이 끊기지 않았다.' },
      [iso(-3)]: { mood: '지침', text: '외부 미팅이 오후에 몰려 산책과 독서를 둘 다 걸렀다. 다음 주에는 점심 직후로 옮겨본다.' },
      [iso(-6)]: { mood: '보통', text: '디자인 시스템 문서 두 개 추가. 속도는 느리지만 매일 하나씩은 쌓이고 있다.' },
      [iso(-8)]: { mood: '좋음', text: '한 주를 가볍게 시작했다. 아침 스트레칭 후 바로 코드 리뷰.' },
    },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData();
    const parsed = JSON.parse(raw);
    return {
      habits: parsed.habits ?? [],
      habitHistory: parsed.habitHistory ?? {},
      goals: parsed.goals ?? [],
      diaryEntries: parsed.diaryEntries ?? {},
    };
  } catch {
    return seedData();
  }
}

function useAppState() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage unavailable (e.g. private mode quota) — data just won't persist
    }
  }, [state]);

  return [state, setState];
}

export { useAppState };
