import Field from "./Field";
import OptionPill from "./OptionPill";
import {
  INTERESTS,
  MAX_INTERESTS,
  toggleInterest,
  interestRank,
} from "@/lib/interests";

const PACE = ["悠闲", "适中", "紧凑"];
const WITH = ["独自", "情侣", "亲子", "朋友", "家庭"];
const FOOD = ["清淡", "微辣", "无辣不欢", "甜口", "无所谓"];
const PROFILE_TAGS = ["爱拍照", "爱美食", "少走路", "亲子友好", "预算优先", "小众探索"];
const VARIANTS = [
  { value: 1, label: "1 个 · 最优方案" },
  { value: 2, label: "2 个 · 方案对比" },
  { value: 3, label: "3 个 · 方案对比" },
];

export default function StepPreferences({ form, update }) {
  const interests = Array.isArray(form.interests) ? form.interests : [];
  const interestsFull = interests.length >= MAX_INTERESTS;

  return (
    <div className="space-y-6">
      <Field label="生成方案" hint="一次生成多个风格方案，方便对比选择">
        <div className="flex flex-wrap gap-2">
          {VARIANTS.map((v) => (
            <OptionPill
              key={v.value}
              label={v.label}
              selected={form.variants === v.value}
              onClick={() => update("variants", v.value)}
            />
          ))}
        </div>
      </Field>

      <Field label="旅行节奏" hint="喜欢慢悠悠还是赶场子？">
        <div className="flex flex-wrap gap-2">
          {PACE.map((o) => (
            <OptionPill
              key={o}
              label={o}
              selected={form.pace === o}
              onClick={() => update("pace", o)}
            />
          ))}
        </div>
      </Field>

      <Field label="和谁一起" hint="AI 会据此调整住宿与行程安排">
        <div className="flex flex-wrap gap-2">
          {WITH.map((o) => (
            <OptionPill
              key={o}
              label={o}
              selected={form.with === o}
              onClick={() => update("with", o)}
            />
          ))}
        </div>
      </Field>

      <Field label="美食口味">
        <div className="flex flex-wrap gap-2">
          {FOOD.map((o) => (
            <OptionPill
              key={o}
              label={o}
              selected={form.foodPreference === o}
              onClick={() => update("foodPreference", o)}
            />
          ))}
        </div>
      </Field>

      {/* 有序多选：最多 3 个，右下角数字即优先级，数字越小权重越大 */}
      <Field
        label="感兴趣的"
        hint={`可多选，最多 ${MAX_INTERESTS} 个；角标数字越小优先级越高`}
      >
        <div className="flex flex-wrap gap-x-2 gap-y-3">
          {INTERESTS.map((o) => {
            const rank = interestRank(interests, o);
            return (
              <OptionPill
                key={o}
                label={o}
                selected={rank != null}
                rank={rank}
                disabled={interestsFull && rank == null}
                onClick={() => update("interests", toggleInterest(interests, o))}
              />
            );
          })}
        </div>
        <p className="mt-2 t-small text-dim" aria-live="polite">
          {interests.length === 0
            ? "还没有选择，AI 将按「全面体验」安排"
            : `已选 ${interests.length}/${MAX_INTERESTS}：${interests
                .map((item, i) => `${i + 1} ${item}`)
                .join(" · ")}`}
        </p>
      </Field>

      <Field label="偏好画像" hint="可多选，保存后下次自动带入">
        <div className="flex flex-wrap gap-2">
          {PROFILE_TAGS.map((tag) => {
            const selected = (form.profileTags || []).includes(tag);
            return (
              <OptionPill
                key={tag}
                label={tag}
                selected={selected}
                onClick={() =>
                  update(
                    "profileTags",
                    selected
                      ? (form.profileTags || []).filter((item) => item !== tag)
                      : [...(form.profileTags || []), tag]
                  )
                }
              />
            );
          })}
        </div>
      </Field>

      <Field label="其他要求" hint="如：想去看大熊猫、带老人出行、避免爬山等">
        <textarea
          rows={3}
          value={form.extra}
          onChange={(e) => update("extra", e.target.value)}
          placeholder="还有什么想让 AI 特别考虑的？"
          className="input-dark resize-none"
        />
      </Field>
    </div>
  );
}
