"use client";

import { useMemo, useEffect, useRef } from "react";

type StackedPoint = {
  date: string; // YYYY-MM-DD
  subjects: Record<string, number>; // hours by subject
};

type ChartProps = {
  data: StackedPoint[];
};

const SUBJECT_ORDER = ["数学", "英語", "情報", "物理", "化学", "その他"];
const SUBJECT_COLORS: Record<string, string> = {
  数学: "bg-indigo-500",
  英語: "bg-blue-500",
  情報: "bg-emerald-500",
  物理: "bg-purple-500",
  化学: "bg-teal-500",
  その他: "bg-slate-500",
};
const FALLBACK_COLORS = [
  "bg-pink-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
];

export function Chart({ data }: ChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const totals = useMemo(
    () => data.map((d) => Object.values(d.subjects).reduce((a, b) => a + b, 0)),
    [data]
  );

  const maxHours = useMemo(() => Math.max(...totals, 5), [totals]);

  const totalHours = useMemo(
    () => totals.reduce((a, b) => a + b, 0),
    [totals]
  );

  const averageHours = useMemo(
    () => (data.length > 0 ? (totalHours / data.length).toFixed(1) : "0.0"),
    [data.length, totalHours]
  );

  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => Object.keys(d.subjects).forEach((s) => set.add(s)));
    const known = SUBJECT_ORDER.filter((s) => set.has(s));
    const unknown = Array.from(set)
      .filter((s) => !SUBJECT_ORDER.includes(s))
      .sort();
    return [...known, ...unknown];
  }, [data]);

  const colorFor = (subject: string, index: number) => {
    if (SUBJECT_COLORS[subject]) return SUBJECT_COLORS[subject];
    const fallbackIndex = index % FALLBACK_COLORS.length;
    return FALLBACK_COLORS[fallbackIndex];
  };

  // スクロールを右端（最新）に初期化
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data]);

  return (
    <div className="w-full">
      {/* 統計情報 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-slate-400 text-xs mb-1">合計時間</div>
          <div className="text-white text-2xl font-bold">
            {totalHours.toFixed(1)}<span className="text-sm ml-1">h</span>
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-slate-400 text-xs mb-1">平均時間</div>
          <div className="text-white text-2xl font-bold">
            {averageHours}<span className="text-sm ml-1">h</span>
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-slate-400 text-xs mb-1">記録日数</div>
          <div className="text-white text-2xl font-bold">
            {data.length}<span className="text-sm ml-1">日</span>
          </div>
        </div>
      </div>

      {/* チャート */}
      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="text-white text-sm font-semibold mb-4">日別学習時間（科目別・積み上げ）</h3>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            データがありません
          </div>
        ) : (
          <div className="relative">
            {/* Y軸ラベル */}
            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-400 z-10 bg-slate-700">
              {[...Array(6)].map((_, i) => {
                const value = (maxHours * (5 - i)) / 5;
                return (
                  <div key={i} className="text-right pr-2">
                    {value.toFixed(0)}h
                  </div>
                );
              })}
            </div>

            {/* グラフエリア（横スクロール対応） */}
            <div ref={scrollRef} className="ml-12 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div style={{ minWidth: `${Math.max(400, data.length * 80)}px` }}>
              {/* グリッドライン */}
              <div className="relative h-64 border-l border-b border-slate-600">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-slate-600/30"
                    style={{ top: `${(i * 100) / 5}%` }}
                  />
                ))}

                {/* 棒グラフ（積み上げ） */}
                <div className="absolute inset-0 flex items-end pb-1">
                  {data.map((item, index) => {
                    const total = totals[index] || 0;
                    const segments = allSubjects
                      .map((s, si) => ({
                        subject: s,
                        hours: item.subjects[s] || 0,
                        color: colorFor(s, si),
                      }))
                      .filter((seg) => seg.hours > 0);

                    return (
                      <div key={index} className="flex flex-col items-center justify-end gap-1 group h-full" style={{ width: '80px' }}>
                        {/* ツールチップ */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap mb-1 shadow-lg">
                          合計 {total.toFixed(1)}h
                          {segments.map((seg) => (
                            <div key={seg.subject} className="flex items-center gap-2">
                              <span className={`inline-block w-2 h-2 rounded ${seg.color}`}></span>
                              <span>{seg.subject}: {seg.hours.toFixed(1)}h</span>
                            </div>
                          ))}
                        </div>

                        {/* スタック本体 */}
                        <div className="w-full max-w-[40px] h-full flex flex-col justify-end">
                          {segments.map((seg, si) => (
                            <div
                              key={si}
                              className={`${seg.color} ${si === 0 ? "rounded-t" : ""}`}
                              style={{ height: `${(seg.hours / Math.max(maxHours, 0.0001)) * 100}%` }}
                              title={`${seg.subject}: ${seg.hours.toFixed(1)}h`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X軸ラベル（日付） */}
              <div className="flex mt-2 text-xs text-slate-400">
                {data.map((item, index) => {
                  const date = new Date(item.date);
                  const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
                  return (
                    <div key={index} className="text-center" style={{ width: '80px' }}>
                      {monthDay}
                    </div>
                  );
                })}
              </div>
              </div>
            </div>
          </div>
        )}

        {/* 凡例 */}
        {allSubjects.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
            {allSubjects.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded ${colorFor(s, i)}`}></span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
