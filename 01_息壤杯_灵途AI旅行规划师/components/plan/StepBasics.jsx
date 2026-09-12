import { destinations } from "@/data/destinations";
import Field from "./Field";
import OptionPill from "./OptionPill";

const QUICK_CITIES = destinations.map((d) => d.name);
const QUICK_PEOPLE = [1, 2, 3, 4, 5, 6];

export default function StepBasics({ form, update }) {
  const days = Number(form.days) || 0;
  const budget = Number(form.budget) || 0;
  const people = Number(form.people) || 0;
  // 人均每天可用预算，帮用户判断预算是否合理
  const perPersonDay =
    days > 0 && people > 0 && budget > 0
      ? Math.round(budget / people / days)
      : null;

  return (
    <div className="space-y-6">
      <Field label="目的地 *" hint="选择热门城市，或手动输入任意目的地">
        <div className="flex flex-wrap gap-2">
          {QUICK_CITIES.map((c) => (
            <OptionPill
              key={c}
              label={c}
              selected={form.destination === c}
              onClick={() => update("destination", c)}
            />
          ))}
        </div>
        <input
          type="text"
          value={form.destination}
          onChange={(e) => update("destination", e.target.value)}
          placeholder="如：杭州、厦门、东京……"
          className="input-dark mt-3"
        />
      </Field>

      {/* 天数 / 人数 / 预算：窄屏 1 列，宽屏 3 等分列（底部对齐） */}
      <div className="grid gap-[clamp(0.7rem,1.6vw,1.2rem)] sm:grid-cols-3">
        <Field label="出行天数 *" hint="1~14 天">
          <input
            type="number"
            min={1}
            max={14}
            inputMode="numeric"
            value={form.days}
            onChange={(e) => update("days", e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="出行人数 *" hint="1~20 人">
          <input
            type="number"
            min={1}
            max={20}
            inputMode="numeric"
            value={form.people}
            onChange={(e) => update("people", e.target.value)}
            className="input-dark"
          />
        </Field>
        <Field label="总预算（元）*" hint="≥100 元">
          <input
            type="number"
            min={100}
            max={999999999}
            step={500}
            inputMode="numeric"
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
            className="input-dark"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="t-small text-dim">快捷人数</span>
        {QUICK_PEOPLE.map((n) => (
          <OptionPill
            key={n}
            label={`${n} 人`}
            selected={Number(form.people) === n}
            onClick={() => update("people", n)}
          />
        ))}
      </div>

      {perPersonDay !== null && (
        <p className="t-small text-dim">
          <i className="fa-solid fa-calculator mr-1.5" aria-hidden="true" />
          相当于人均每天约 <b className="text-accent">¥{perPersonDay}</b>
          {perPersonDay < 150 ? "（偏紧，AI 会以经济方案为主）" : ""}
        </p>
      )}

      <Field label="出发城市" hint="可选，AI 会考虑往返大交通">
        <input
          type="text"
          value={form.departureCity}
          onChange={(e) => update("departureCity", e.target.value)}
          placeholder="如：上海"
          className="input-dark"
        />
      </Field>
    </div>
  );
}
