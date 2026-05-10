'use client';

/**
 * Informational panel for "বলের প্রকার" — replaces the canvas scene with a
 * structured visual reference: contact/non-contact, balanced/unbalanced,
 * 4 fundamental forces. Pure CSS layout (no Canvas) — text + emojis.
 */
export default function ForceTypesPanel() {
  return (
    <div
      className="w-full h-full overflow-y-auto p-4 lg:p-6"
      style={{
        background: 'linear-gradient(135deg, #FFF8E7 0%, #DBEAFE 50%, #F0F9FF 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Title */}
        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid #E2E8F0',
          }}
        >
          <h2 className="text-xl font-bold mb-1" style={{ color: '#1E293B' }}>
            📚 বলের প্রকারভেদ
          </h2>
          <p className="text-xs" style={{ color: '#64748B' }}>
            NCTB Chapter 3.2 — চারটি মৌলিক বল + স্পর্শ/অস্পর্শ + সাম্য/অসাম্য
          </p>
        </div>

        {/* Contact vs Non-contact */}
        <Section title="স্পর্শ ও অস্পর্শ বল" color="#16A34A" icon="🤝">
          <div className="grid grid-cols-2 gap-3">
            <Card label="স্পর্শ বল" emoji="✊" desc="দুটি বস্তু সরাসরি স্পর্শে থাকলে। যেমন: ধাক্কা, টান, ঘর্ষণ, normal force।" />
            <Card label="অস্পর্শ বল" emoji="🧲" desc="বস্তু দূরে থেকেও বল প্রয়োগ। যেমন: মহাকর্ষ, চৌম্বক, বৈদ্যুতিক।" />
          </div>
        </Section>

        {/* Balanced vs Unbalanced */}
        <Section title="সাম্য ও অসাম্য বল" color="#3B82F6" icon="⚖️">
          <div className="grid grid-cols-2 gap-3">
            <Card
              label="সাম্য বল (F_net = 0)"
              emoji="🔁"
              desc="দুদিক থেকে সমান বল → বস্তু বিশ্রামে অথবা সমান বেগে চলতে থাকে। (নিউটনের ১ম সূত্র)"
            />
            <Card
              label="অসাম্য বল (F_net ≠ 0)"
              emoji="➡️"
              desc="net force থাকলে ত্বরণ তৈরি হয়, বস্তু গতি পরিবর্তন করে। (নিউটনের ২য় সূত্র)"
            />
          </div>
        </Section>

        {/* 4 Fundamental forces */}
        <Section title="প্রকৃতির চারটি মৌলিক বল" color="#8B5CF6" icon="🌌">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card
              label="মহাকর্ষ বল"
              emoji="🌍"
              desc="ভর সম্পন্ন বস্তুর মধ্যে আকর্ষণ। সবচেয়ে দুর্বল কিন্তু অসীম পাল্লার। F = Gm₁m₂/r²"
              tag="Gravitational"
            />
            <Card
              label="তাড়িতচৌম্বক বল"
              emoji="⚡"
              desc="চার্জিত বস্তুর মধ্যে আকর্ষণ/বিকর্ষণ + চৌম্বকীয় বল। আলো, বিদ্যুৎ, রসায়নিক বন্ধন।"
              tag="Electromagnetic"
            />
            <Card
              label="দুর্বল নিউক্লীয় বল"
              emoji="☢️"
              desc="তেজস্ক্রিয় ক্ষয় (β-decay) এবং অন্যান্য sub-atomic পরিবর্তন। অতি ক্ষুদ্র পাল্লা (~10⁻¹⁸ m)।"
              tag="Weak Nuclear"
            />
            <Card
              label="সবল নিউক্লীয় বল"
              emoji="⚛️"
              desc="proton ও neutron-কে নিউক্লিয়াসে ধরে রাখে। সবচেয়ে শক্তিশালী, কিন্তু পাল্লা ক্ষুদ্র (~10⁻¹⁵ m)।"
              tag="Strong Nuclear"
            />
          </div>
        </Section>

        {/* Quick comparison table */}
        <Section title="সংক্ষিপ্ত তুলনা" color="#EA580C" icon="📊">
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
          >
            <table className="w-full text-xs">
              <thead style={{ background: '#F1F5F9' }}>
                <tr>
                  <th className="text-left p-2 font-semibold" style={{ color: '#475569' }}>বল</th>
                  <th className="text-left p-2 font-semibold" style={{ color: '#475569' }}>আপেক্ষিক শক্তি</th>
                  <th className="text-left p-2 font-semibold" style={{ color: '#475569' }}>পাল্লা</th>
                  <th className="text-left p-2 font-semibold" style={{ color: '#475569' }}>উদাহরণ</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['সবল নিউক্লীয়', '১', '~10⁻¹⁵ m', 'নিউক্লিয়াস বাঁধা'],
                  ['তাড়িতচৌম্বক', '১/১৩৭', 'অসীম', 'বিদ্যুৎ, আলো'],
                  ['দুর্বল নিউক্লীয়', '১০⁻⁶', '~10⁻¹⁸ m', 'β-decay'],
                  ['মহাকর্ষ', '১০⁻³⁹', 'অসীম', 'গ্রহ, পতন'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                    {row.map((c, j) => (
                      <td key={j} className="p-2" style={{ color: j === 0 ? '#1E293B' : '#475569', fontWeight: j === 0 ? 600 : 400 }}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Connection to other tabs */}
        <div
          className="rounded-xl p-3 text-xs leading-relaxed"
          style={{
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            color: '#92400E',
          }}
        >
          💡 অন্য tab-গুলোতে যাও:
          <ul className="list-disc ml-5 mt-1 space-y-0.5">
            <li>🛒 <b>F = ma</b> — অসাম্য বলের ফলে ত্বরণ</li>
            <li>🚂 <b>ভরবেগ</b> — গতিশীল বস্তুর "তাড়না"</li>
            <li>🏏 <b>আবেগ</b> — অল্প সময়ে বড় বল কাজ করে</li>
            <li>🪐 <b>ওজন</b> — মহাকর্ষ বল বিভিন্ন গ্রহে</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  color,
  icon,
  children,
}: {
  title: string;
  color: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid #E2E8F0',
      }}
    >
      <h3
        className="text-sm font-bold mb-2 flex items-center gap-1.5"
        style={{ color }}
      >
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}

function Card({
  label,
  emoji,
  desc,
  tag,
}: {
  label: string;
  emoji: string;
  desc: string;
  tag?: string;
}) {
  return (
    <div
      className="rounded-lg p-2.5"
      style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
      }}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span style={{ fontSize: '20px' }}>{emoji}</span>
        <span className="font-semibold text-xs" style={{ color: '#1E293B' }}>
          {label}
        </span>
        {tag && (
          <span
            className="text-[9px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: '#EDE9FE', color: '#6D28D9' }}
          >
            {tag}
          </span>
        )}
      </div>
      <p className="text-[11px] leading-snug" style={{ color: '#475569' }}>
        {desc}
      </p>
    </div>
  );
}
