try {
  process.loadEnvFile('.env.e2e');
} catch {
  /* bỏ qua nếu môi trường CI hoặc chưa có file .env.e2e */
}

const required = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Thiếu biến môi trường ${key}. Hãy kiểm tra .env.e2e`);
  }
  return value;
};

export const env = {
  baseUrl: required('E2E_BASE_URL', 'http://localhost:3000'),
  headless: (process.env.E2E_HEADLESS ?? 'false') === 'true',
  timeoutMs: Number(process.env.E2E_TIMEOUT_SECONDS ?? '10') * 1000,
  accounts: {
    student: {
      email: process.env.E2E_STUDENT_EMAIL ?? '',
      password: process.env.E2E_STUDENT_PASSWORD ?? '',
    },
    teacher: {
      email: process.env.E2E_TEACHER_EMAIL ?? '',
      password: process.env.E2E_TEACHER_PASSWORD ?? '',
    },
    staff: {
      email: process.env.E2E_STAFF_EMAIL ?? '',
      password: process.env.E2E_STAFF_PASSWORD ?? '',
    },
  },
};

