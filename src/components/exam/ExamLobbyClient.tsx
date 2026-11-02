"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Leaf, Sprout } from "lucide-react";
import ClassCardReveal from "@/components/classes/ClassCardReveal";
import TypewriterDescription from "@/components/classes/TypewriterDescription";
import ExamFilterBar from "./ExamFilterBar";
import ExamCardItem from "./ExamCardItem";
import ExamStartModal from "./ExamStartModal";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { matchSmartSearch } from "@/lib/search-utils";
import {
  MOCK_EXAMS,
  ExamItem,
  ExamCategory,
  ExamSubject,
  ExamDifficulty,
} from "./exam-data";

const examTitleLines = ["Phòng thi thử", "trực tuyến & luyện đề"];
const examDescription =
  "Tổng hợp các bộ đề thi thử bám sát ma trận mới của Bộ GD&ĐT và cấu trúc ĐGNL 2026. Bấm giờ áp lực phòng thi thật, chấm điểm tức thì, xem lời giải chi tiết và tích lũy điểm thưởng XP cùng EduMi.";

function DropLetterTitle() {
  let letterIndex = 0;
  const fullTitle = examTitleLines.join(" ");

  return (
    <h1
      aria-label={fullTitle}
      className="max-w-[720px] text-[46px] sm:text-[54px] font-black leading-[1.02] tracking-[-0.055em] text-[#092235]"
    >
      {examTitleLines.map((line) => (
        <span key={line} aria-hidden="true" className="block">
          {line.split("").map((letter, index) => {
            const delay = letter === " " ? letterIndex : letterIndex++;

            return (
              <span
                key={`${line}-${index}`}
                className={letter === " " ? "inline-block w-[0.24em]" : "class-title-letter"}
                style={{ animationDelay: `${delay * 48}ms` }}
              >
                {letter}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

export default function ExamLobbyClient({
  initialExams,
}: {
  initialExams?: ExamItem[];
} = {}) {
  const searchParams = useSearchParams();

  // Filter States với Debounced Search (300ms)
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery,
    isPending: isSearching,
    clearQuery: clearSearch,
  } = useDebouncedSearch({ delay: 300 });

  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>("Tất cả");
  const [selectedSubject, setSelectedSubject] = useState<ExamSubject>("Tất cả");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExamDifficulty>("Tất cả");
  const [selectedSort, setSelectedSort] = useState("popular");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [modalMode, setModalMode] = useState<"exam" | "practice">("exam");

  const handleOpenModal = (exam: ExamItem, mode: "exam" | "practice" = "exam") => {
    setSelectedExam(exam);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  // Real exams fetched from Supabase API with initialExams / MOCK_EXAMS fallback
  const [examsList, setExamsList] = useState<ExamItem[]>(() => {
    if (initialExams && initialExams.length > 0) return initialExams;
    return MOCK_EXAMS;
  });

  useEffect(() => {
    if (initialExams && initialExams.length > 0) {
      setExamsList(initialExams);
    }
  }, [initialExams]);

  useEffect(() => {
    let isMounted = true;
    async function loadExams() {
      try {
        const res = await fetch("/api/exams", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.exams) && data.exams.length > 0 && isMounted) {
            setExamsList(data.exams);
          }
        }
      } catch (err) {
        console.warn("Could not load real exams, using default bank:", err);
      }
    }
    loadExams();
    return () => {
      isMounted = false;
    };
  }, []);

  // Direct URL support: ?subject=Toán học, ?code=EDM-8899 or ?pin=EDM-8899
  useEffect(() => {
    const subject = searchParams.get("subject")?.trim();
    if (subject) {
      const matchedSubject = examsList.find((exam) => exam.subject === subject)?.subject;
      if (matchedSubject) setSelectedSubject(matchedSubject);
    }

    const code = searchParams.get("code") || searchParams.get("pin");
    if (code) {
      const trimmed = code.trim();
      setSearchQuery(trimmed);
      const matched = examsList.find(
        (e) =>
          e.examCode.toLowerCase() === trimmed.toLowerCase() ||
          e.examCode.toLowerCase().replace("-", "") === trimmed.toLowerCase().replace("-", "") ||
          e.id.toLowerCase() === trimmed.toLowerCase()
      );
      if (matched) {
        handleOpenModal(matched, "exam");
      }
    }
  }, [searchParams, examsList]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== "Tất cả" ||
    selectedSubject !== "Tất cả" ||
    selectedDuration !== "all" ||
    selectedDifficulty !== "Tất cả" ||
    selectedSort !== "popular";

  const handleResetFilters = () => {
    clearSearch();
    setSelectedCategory("Tất cả");
    setSelectedSubject("Tất cả");
    setSelectedDuration("all");
    setSelectedDifficulty("Tất cả");
    setSelectedSort("popular");
  };

  // Check if current search matches an exact PIN
  const exactPinMatch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return examsList.find(
      (item) =>
        item.examCode.toLowerCase() === q ||
        item.examCode.toLowerCase().replace("-", "") === q.replace("-", "")
    );
  }, [searchQuery, examsList]);

// Hàm chuẩn hóa tiếng Việt: bỏ dấu, hỗ trợ i <-> y (ví dụ lí <-> lý, kĩ <-> kỹ), bỏ gạch nối
function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/y/g, "i")
    .trim();
}

function matchSearch(sourceText: string, query: string): boolean {
  if (!query) return true;
  if (!sourceText) return false;
  const normSource = normalizeSearchText(sourceText);
  const normQuery = normalizeSearchText(query);
  if (!normQuery) return true;
  if (normQuery.length <= 2) {
    const words = normSource.split(/[^a-z0-9]+/);
    return words.some((w) => w === normQuery);
  }
  return normSource.includes(normQuery);
}

  // Filter & Sort Logic
  const filteredExams = useMemo(() => {
    let list = [...examsList];

    // 1. Search Query: Smart multi-token + PIN matching (e.g., EDM-8899 / EDM8899)
    const activeSearch = (searchQuery || debouncedQuery).trim();
    if (activeSearch) {
      const q = activeSearch;

      list = list.filter((item) => {
        // Khớp PIN hoặc ID
        if (
          matchSmartSearch(item.examCode, q) ||
          item.id.toLowerCase() === q.toLowerCase()
        ) {
          return true;
        }

        // Khớp Tiêu đề, Mã thẻ, Môn học, Thể loại, Tác giả
        return (
          matchSmartSearch(item.title, q) ||
          matchSmartSearch(item.cardCode, q) ||
          matchSmartSearch(item.subject, q) ||
          matchSmartSearch(item.category, q) ||
          matchSmartSearch(item.author, q)
        );
      });
    }

    // 2. Category
    if (selectedCategory !== "Tất cả") {
      list = list.filter((item) => item.category === selectedCategory);
    }

    // 3. Subject
    if (selectedSubject !== "Tất cả") {
      list = list.filter((item) => item.subject === selectedSubject);
    }

    // 4. Duration
    if (selectedDuration === "short") {
      list = list.filter((item) => item.durationMinutes <= 45);
    } else if (selectedDuration === "medium") {
      list = list.filter((item) => item.durationMinutes > 45 && item.durationMinutes <= 60);
    } else if (selectedDuration === "long") {
      list = list.filter((item) => item.durationMinutes > 60);
    }

    // 5. Difficulty
    if (selectedDifficulty !== "Tất cả") {
      list = list.filter((item) => item.difficulty === selectedDifficulty);
    }

    // 6. Sort
    if (selectedSort === "newest") {
      list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    } else if (selectedSort === "attempts") {
      list.sort((a, b) => b.attempts - a.attempts);
    } else if (selectedSort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === "duration_asc") {
      list.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else {
      // Mặc định (Phổ biến): Ưu tiên đề có cờ isNew hoặc mới tạo trong vòng 7 ngày lên đầu, sau đó đến đề HOT, và sắp xếp theo ngày tạo mới nhất
      list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        const isRecentA = a.isNew || (timeA > 0 && Date.now() - timeA < 7 * 86400000);
        const isRecentB = b.isNew || (timeB > 0 && Date.now() - timeB < 7 * 86400000);

        if (isRecentB && !isRecentA) return 1;
        if (isRecentA && !isRecentB) return -1;

        if (b.isHot !== a.isHot) {
          return (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0);
        }

        return timeB - timeA;
      });
    }

    return list;
  }, [
    searchQuery,
    debouncedQuery,
    examsList,
    selectedCategory,
    selectedSubject,
    selectedDuration,
    selectedDifficulty,
    selectedSort,
  ]);

  return (
    <div
      className="relative min-h-screen pb-16 pt-[92px]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }}
    >
      {/* Decorative leafy doodles */}
      <Leaf className="absolute left-8 top-[110px] h-10 w-10 rotate-[-20deg] text-white/65 pointer-events-none" />
      <Leaf className="absolute left-10 top-[480px] h-12 w-12 rotate-[30deg] text-white/65 pointer-events-none" />
      <Sprout className="absolute right-14 top-[510px] h-8 w-8 text-white/70 pointer-events-none" />

      {/* Decorative corner stickers */}
      <Image
        src="/stickers/classes-corner-3d.png"
        alt=""
        aria-hidden="true"
        width={210}
        height={222}
        className="pointer-events-none absolute bottom-5 left-3 z-[1] h-auto w-[170px] -rotate-6 opacity-95 drop-shadow-[0_18px_24px_rgba(29,55,30,0.22)]"
      />
      <Image
        src="/stickers/classes-corner-3d.png"
        alt=""
        aria-hidden="true"
        width={210}
        height={222}
        className="pointer-events-none absolute bottom-5 right-3 z-[1] h-auto w-[178px] rotate-6 scale-x-[-1] opacity-95 drop-shadow-[0_18px_24px_rgba(29,55,30,0.22)]"
      />

      {/* Capybara Mascot Character with Star Badge / Exam Checklist */}
      <Image
        src="/Capybara_ôm_huy_hiệu_ngôi_sao-removebg-preview.png"
        alt="Capybara EduMi Phòng Thi Thử"
        width={480}
        height={480}
        priority
        className="class-hero-mascot-pop pointer-events-none absolute right-[180px] top-[75px] z-[2] hidden h-auto w-[330px] xl:block 2xl:right-[260px] 2xl:w-[380px] drop-shadow-[0_24px_34px_rgba(17,42,25,0.24)]"
      />

      {/* Hero Section */}
      <section className="mx-auto max-w-[1280px] px-6 pt-6">
        <div className="pb-8">
          <DropLetterTitle />
          <TypewriterDescription text={examDescription} />

          <div className="relative mt-2 h-10">
            <span className="absolute left-[440px] top-0 text-[34px] font-black text-[#f6be3d]">〃</span>
            <span className="absolute left-[506px] top-6 h-[2px] w-14 -rotate-[20deg] bg-white/80" />
          </div>
        </div>
      </section>

      {/* Pill Filter Bar */}
      <ExamFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearching}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedDuration={selectedDuration}
        onDurationChange={setSelectedDuration}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Alert banner when exact PIN is matched */}
      {exactPinMatch && (
        <section className="relative z-10 mx-auto mt-4 max-w-[1390px] px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-white/95 backdrop-blur-md p-4 px-6 shadow-md animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-lg font-black">
                🎯
              </span>
              <div>
                <div className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                  Đã tìm thấy phòng thi theo Mã PIN: {exactPinMatch.examCode}
                </div>
                <div className="text-sm font-black text-slate-900">
                  {exactPinMatch.title} — {exactPinMatch.author}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal(exactPinMatch, "exam")}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-black text-white shadow-sm transition cursor-pointer active:scale-95"
            >
              Vào thi ngay →
            </button>
          </div>
        </section>
      )}

      {/* Cards Grid */}
      <section className="relative z-10 mx-auto mt-6 grid max-w-[1390px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6">
        {filteredExams.length > 0 ? (
          filteredExams.map((card, index) => (
            <ClassCardReveal key={card.id} index={index} columns={4}>
              <ExamCardItem card={card} onOpenModal={handleOpenModal} />
            </ClassCardReveal>
          ))
        ) : (
          <div className="col-span-full my-12 flex flex-col items-center justify-center rounded-[32px] bg-white/90 p-12 text-center shadow-lg backdrop-blur-md">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-emerald-50 border border-emerald-200 p-2">
              <Image
                src="/Capybara_EduMi_và_bảng_học_tập-removebg-preview.png"
                alt="Capybara không tìm thấy đề"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900">
              Không tìm thấy đề thi phù hợp
            </h3>
            <p className="mt-1 max-w-md text-xs font-medium text-slate-600">
              Nếu bạn có Mã PIN phòng thi từ giáo viên, hãy kiểm tra lại xem có gõ đúng mã (VD:{" "}
              <strong>EDM-8899</strong>) không nhé!
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </section>

      {/* Exam Start Confirmation Modal */}
      <ExamStartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exam={selectedExam}
        mode={modalMode}
      />
    </div>
  );
}
