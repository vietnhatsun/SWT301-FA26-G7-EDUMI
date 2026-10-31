import { Suspense } from "react";
import Link from "next/link";
import { MOCK_EXAMS, ExamItem } from "@/components/exam/exam-data";
import ExamRoomClient from "@/components/exam/ExamRoomClient";
import { createServiceClient } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}

async function getExamById(id: string): Promise<ExamItem | null> {
  // 1. Kiểm tra MOCK_EXAMS trước
  const mockExam = MOCK_EXAMS.find(
    (e) => e.id === id || e.examCode.toLowerCase() === id.toLowerCase()
  );
  if (mockExam) return mockExam;

  // 2. Tra cứu cơ sở dữ liệu Supabase
  try {
    const supabase = createServiceClient();
    const { data: dbExam } = await supabase
      .from("exams")
      .select("*")
      .or(`id.eq.${id},exam_code.eq.${id.toUpperCase()}`)
      .eq("status", "published")
      .maybeSingle();

    if (dbExam) {
      return {
        id: dbExam.id,
        examCode: dbExam.exam_code,
        category: dbExam.category,
        subject: dbExam.subject,
        cardCode: dbExam.card_code,
        title: dbExam.title,
        description: dbExam.description || "",
        durationMinutes: Number(dbExam.duration_minutes || 60),
        questionCount: Number(dbExam.question_count || 0),
        difficulty: dbExam.difficulty,
        attempts: Number(dbExam.attempts || 0),
        rating: Number(dbExam.rating || 5.0),
        bgClass: dbExam.bg_class || "bg-[#0284c7]",
        accentClass: dbExam.accent_class || "text-[#0284c7]",
        pattern: dbExam.pattern || "waves",
        isHot: Boolean(dbExam.is_hot),
        isNew: Boolean(dbExam.is_new),
        author: dbExam.author || "Hội đồng Khảo thí EduMi",
      };
    }
  } catch (err) {
    console.warn("[ExamRoomPage] Error querying Supabase exam:", err);
  }

  return null;
}

async function getExamQuestionsById(examId: string) {
  try {
    const supabase = createServiceClient();
    const { data: questions } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("exam_id", examId)
      .order("question_number", { ascending: true });

    if (questions && questions.length > 0) {
      return questions.map((q) => ({
        id: q.id,
        questionNumber: q.question_number,
        type: q.type,
        part: q.part || (q.type === "true_false" ? "Phần II" : q.type === "short_answer" ? "Phần III" : q.type === "essay" ? "Phần IV" : "Phần I"),
        section: q.section || (q.type === "essay" ? "Tự luận" : "Trắc nghiệm"),
        instruction: q.instruction,
        content: q.content,
        options: q.options || [],
        trueFalseItems: q.true_false_items || [],
        correctAnswer: q.correct_answer || "",
        explanation: q.explanation || "",
        sampleEssayAnswer: q.sample_essay_answer || "",
        rubricCriteria: q.rubric_criteria || [],
        wordLimit: q.word_limit || undefined,
        points: Number(q.points),
      }));
    }
  } catch (err) {
    console.warn("[ExamRoomPage] Error querying Supabase exam questions:", err);
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await getExamById(id);
  return {
    title: exam ? `${exam.cardCode}: ${exam.title} | Phòng Thi EduMi` : "Phòng Thi Trực Tuyến | EduMi",
    description: "Hệ thống phòng thi trực tuyến bấm giờ áp lực thật, tự động ghi nhận vi phạm cùng EduMi.",
  };
}

export default async function ExamRoomPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const mode = resolvedSearchParams.mode === "practice" ? "practice" : "exam";

  const exam = await getExamById(id);

  if (!exam) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f4f8] p-6 text-center">
        <div className="rounded-3xl bg-white p-8 shadow-md border border-slate-200 max-w-md">
          <h2 className="text-xl font-black text-slate-900">Không tìm thấy phòng thi</h2>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Mã bài thi hoặc phòng thi không tồn tại trong hệ thống.
          </p>
          <Link
            href="/exam"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Quay lại sảnh phòng thi</span>
          </Link>
        </div>
      </main>
    );
  }

  // Tải câu hỏi từ database nếu là đề thi tạo từ Staff
  const dbQuestions = await getExamQuestionsById(exam.id);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] font-bold text-emerald-800">
          Đang kết nối phòng thi EduMi...
        </div>
      }
    >
      <ExamRoomClient exam={exam} mode={mode} initialQuestions={dbQuestions || undefined} />
    </Suspense>
  );
}
