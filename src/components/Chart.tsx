"use client";

import { useMemo } from "react";

type ChartData = {
  date: string;
  hours: number;
};

type ChartProps = {
  data: ChartData[];
};

export function Chart({ data }: ChartProps) {
  const maxHours = useMemo(() => {
    return Math.max(...data.map((d) => d.hours), 5); // 最低5時間表示
  }, [data]);

  const totalHours = useMemo(() => {
    return data.reduce((sum, d) => sum + d.hours, 0);
  }, [data]);

  const averageHours = useMemo(() => {
    return data.length > 0 ? (totalHours / data.length).toFixed(1) : "0.0";
  }, [data, totalHours]);

  return (
    <div className="w-full">
      {/* 統計情報 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-slate-400 text-xs mb-1">合計時間</div>
          <div className="text-white text-2xl font-bold">{totalHours.toFixed(1)}<span className="text-sm ml-1">h</span></div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-slate-400 text-xs mb-1">平均時間</div>
          <div className="text-white text-2xl font-bold">{averageHours}<span className="text-sm ml-1">h</span></div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-slate-400 text-xs mb-1">記録日数</div>
          <div className="text-white text-2xl font-bold">{data.length}<span className="text-sm ml-1">日</span></div>
        </div>
      </div>

      {/* チャート */}
      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="text-white text-sm font-semibold mb-4">日別作業時間</h3>
        
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            データがありません
          </div>
        ) : (
          <div className="relative">
            {/* Y軸ラベル */}
            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-400">
              {[...Array(6)].map((_, i) => {
                const value = (maxHours * (5 - i)) / 5;
                return (
                  <div key={i} className="text-right pr-2">
                    {value.toFixed(0)}h
                  </div>
                );
              })}
            </div>

            {/* グラフエリア */}
            <div className="ml-12">
              {/* グリッドライン */}
              <div className="relative h-64 border-l border-b border-slate-600">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-slate-600/30"
                    style={{ top: `${(i * 100) / 5}%` }}
                  />
                ))}

                {/* 棒グラフ */}
                <div className="absolute inset-0 flex items-end justify-around px-2 pb-1">
                  {data.map((item, index) => {
                    const heightPercent = (item.hours / maxHours) * 100;
                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center justify-end gap-1 group"
                      >
                        {/* ツールチップ */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap mb-1">
                          {item.hours.toFixed(1)}時間
                        </div>

                        {/* バー */}
                        <div
                          className="w-full max-w-[40px] bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X軸ラベル（日付） */}
              <div className="flex justify-around mt-2 text-xs text-slate-400">
                {data.map((item, index) => {
                  const date = new Date(item.date);
                  const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
                  return (
                    <div key={index} className="flex-1 text-center">
                      {monthDay}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
