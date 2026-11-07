import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import {
    Save,
    Plus,
    Trash2,
    Settings,
    Percent,
    AlertCircle,
    User,
    Users,
} from 'lucide-react';
import { AdminContainer, AdminHeader, AdminSidebar } from '../../components';

// ─── Helpers ────────────────────────────────────────────────
const emptyTier = (from = 0) => ({ from, to: null, value: 0 });

const addTier = (tiers) => {
    if (tiers.length === 0) return [{ from: 0, to: null, value: 0 }];
    const last = tiers[tiers.length - 1];
    if (last.to === null || last.to === undefined) {
        const suggestedTo = Math.max((Number(last.from) || 0) + 1000, 1000);
        return [
            ...tiers.slice(0, -1),
            { ...last, to: suggestedTo },
            { from: suggestedTo, to: null, value: 0 },
        ];
    }
    return [...tiers, { from: last.to, to: null, value: 0 }];
};

const removeTier = (tiers, index) => {
    if (tiers.length <= 1) return tiers;
    const next = tiers.filter((_, i) => i !== index);
    if (index === tiers.length - 1 && next.length > 0) {
        next[next.length - 1] = { ...next[next.length - 1], to: null };
    } else if (index > 0 && index < tiers.length - 1) {
        next[index - 1] = { ...next[index - 1], to: tiers[index].to ?? null };
    }
    for (let i = 1; i < next.length; i++) {
        next[i] = { ...next[i], from: next[i - 1].to ?? 0 };
    }
    return next;
};

const updateTier = (tiers, index, field, value) => {
    const next = [...tiers];
    const numeric = value === '' ? '' : Number(value);

    if (field === 'to' && value === '') {
        next[index] = { ...next[index], to: null };
        if (index < next.length - 1) return next.slice(0, index + 1);
        return next;
    }

    next[index] = { ...next[index], [field]: numeric };

    for (let i = index + 1; i < next.length; i++) {
        next[i] = { ...next[i], from: next[i - 1].to ?? 0 };
    }

    return next;
};

const previewTiers = (tiers, amount) => {
    const num = Number(amount) || 0;
    const lines = [];
    let total = 0;

    for (const tier of tiers) {
        const from = Number(tier.from) || 0;
        const to =
            tier.to === null || tier.to === undefined ? Infinity : Number(tier.to);
        const value = Number(tier.value) || 0;

        if (num <= from) break;
        const slice = Math.min(num, to) - from;
        if (slice <= 0) continue;
        const portion = slice * (value / 100);
        total += portion;
        lines.push({ from, to: tier.to, value, slice, portion });
    }

    return { lines, total: Math.round(total * 100) / 100 };
};

const validateTiersClient = (tiers, label) => {
    if (!tiers || tiers.length === 0) return `${label}: at least one tier required`;
    if (Number(tiers[0].from) !== 0) return `${label}: first tier must start at 0`;
    for (let i = 0; i < tiers.length; i++) {
        const t = tiers[i];
        if (Number(t.value) < 0 || Number(t.value) > 100) {
            return `${label} tier ${i + 1}: value must be 0–100`;
        }
        const hasTo = t.to !== null && t.to !== undefined;
        if (hasTo && Number(t.to) <= Number(t.from)) {
            return `${label} tier ${i + 1}: "to" must be greater than "from"`;
        }
        if (i < tiers.length - 1 && !hasTo) {
            return `${label} tier ${i + 1}: only the last tier can be open-ended`;
        }
        if (
            i < tiers.length - 1 &&
            hasTo &&
            Number(t.to) !== Number(tiers[i + 1].from)
        ) {
            return `${label} tiers must be contiguous (tier ${i + 1} → ${i + 2})`;
        }
    }
    return null;
};

const formatCurrency = (amount, currency = 'EUR') => {
    const symbols = { EUR: '€', GBP: '£' };
    return `${symbols[currency] || currency}${Number(amount || 0).toLocaleString(
        'en-IE',
        { maximumFractionDigits: 2 }
    )}`;
};

// ─── Component ──────────────────────────────────────────────
const Commissions = () => {
    const [sellerTiers, setSellerTiers] = useState([emptyTier(0)]);
    const [bidderTiers, setBidderTiers] = useState([emptyTier(0)]);
    const [isEnabled, setIsEnabled] = useState(true);
    const [appliesTo, setAppliesTo] = useState(['seller']);
    const [maxCommissionAmount, setMaxCommissionAmount] = useState('');
    const [maxCommissionCurrency, setMaxCommissionCurrency] = useState('EUR');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewAmount, setPreviewAmount] = useState(3000);

    // ── Fetch ──
    const fetchCommission = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/api/v1/commissions');
            if (data.success) {
                const c = data.data.commission;
                setSellerTiers(c.sellerTiers?.length ? c.sellerTiers : [emptyTier(0)]);
                setBidderTiers(c.bidderTiers?.length ? c.bidderTiers : [emptyTier(0)]);
                setIsEnabled(c.isEnabled ?? true);
                setAppliesTo(c.appliesTo?.length ? c.appliesTo : ['seller']);
                setMaxCommissionAmount(
                    c.maxCommissionAmount !== null && c.maxCommissionAmount !== undefined
                        ? String(c.maxCommissionAmount)
                        : ''
                );
                setMaxCommissionCurrency(c.maxCommissionCurrency || 'EUR');
            }
        } catch (err) {
            console.error('Fetch commission error:', err);
            toast.error(
                err.response?.data?.message || 'Failed to fetch commission settings'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommission();
    }, []);

    // ── Actions ──
    const handleToggleParty = (party) => {
        setAppliesTo((prev) => {
            if (prev.includes(party)) {
                const next = prev.filter((p) => p !== party);
                return next.length > 0 ? next : prev;
            }
            return [...prev, party];
        });
    };

    const handleSave = async () => {
        const sellerErr = validateTiersClient(sellerTiers, 'Seller');
        if (sellerErr) return toast.error(sellerErr);
        const bidderErr = validateTiersClient(bidderTiers, 'Bidder');
        if (bidderErr) return toast.error(bidderErr);

        try {
            setSaving(true);
            const { data } = await axiosInstance.put('/api/v1/commissions', {
                sellerTiers: sellerTiers.map((t) => ({
                    from: Number(t.from),
                    to: t.to === null || t.to === '' ? null : Number(t.to),
                    value: Number(t.value),
                })),
                bidderTiers: bidderTiers.map((t) => ({
                    from: Number(t.from),
                    to: t.to === null || t.to === '' ? null : Number(t.to),
                    value: Number(t.value),
                })),
                isEnabled,
                appliesTo,
                maxCommissionAmount:
                    maxCommissionAmount === '' ? null : Number(maxCommissionAmount),
                maxCommissionCurrency,
            });

            if (data.success) {
                toast.success('Commission settings updated successfully');
                fetchCommission();
            }
        } catch (err) {
            console.error('Update commission error:', err);
            toast.error(
                err.response?.data?.message || 'Failed to update commission settings'
            );
        } finally {
            setSaving(false);
        }
    };

    // ── Tier Editor ──
    const renderTierEditor = (tiers, setTiers, label, icon, isActive) => {
        const preview = previewTiers(tiers, previewAmount);
        const Icon = icon;

        return (
            <div
                className={`rounded-xl border-2 p-5 transition-all ${isActive
                    ? 'border-[#D19F3E] bg-white shadow-sm'
                    : 'border-gray-200 bg-gray-50 opacity-70'
                    }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div
                            className={`p-2 rounded-lg ${isActive
                                ? 'bg-[#D19F3E]/10 text-[#D19F3E]'
                                : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            <Icon size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{label} Tiers</h3>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setTiers(addTier(tiers))}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#D19F3E] text-white rounded-lg hover:bg-[#B88A2E]"
                    >
                        <Plus size={14} />
                        Add Tier
                    </button>
                </div>

                {/* Tiers table */}
                <div className="space-y-2 mb-4">
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                        <div className="col-span-3">From</div>
                        <div className="col-span-3">To</div>
                        <div className="col-span-4">Rate (%)</div>
                        <div className="col-span-2 text-right">Remove</div>
                    </div>

                    {tiers.map((tier, idx) => {
                        const isLast = idx === tiers.length - 1;
                        return (
                            <div
                                key={idx}
                                className="grid grid-cols-12 gap-2 items-center"
                            >
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        value={tier.from}
                                        readOnly={idx !== 0}
                                        onChange={(e) =>
                                            setTiers(updateTier(tiers, idx, 'from', e.target.value))
                                        }
                                        className={`w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm ${idx !== 0 ? 'bg-gray-100 text-gray-500' : ''
                                            }`}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        value={tier.to === null ? '' : tier.to}
                                        placeholder={isLast ? '∞ (open)' : ''}
                                        onChange={(e) =>
                                            setTiers(updateTier(tiers, idx, 'to', e.target.value))
                                        }
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div className="col-span-4 relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={tier.value}
                                        onChange={(e) =>
                                            setTiers(updateTier(tiers, idx, 'value', e.target.value))
                                        }
                                        className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded-md text-sm"
                                    />
                                    <Percent
                                        size={12}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setTiers(removeTier(tiers, idx))}
                                        disabled={tiers.length <= 1}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Remove tier"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Live preview */}
                {/* <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                            Preview at sale amount:
                        </span>
                        <input
                            type="number"
                            min="0"
                            value={previewAmount}
                            onChange={(e) => setPreviewAmount(e.target.value)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded-md text-sm text-right"
                        />
                    </div>

                    {preview.lines.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">
                            Enter an amount above the first tier's "From" to see the breakdown.
                        </p>
                    ) : (
                        <div className="space-y-1 text-xs">
                            {preview.lines.map((line, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between text-gray-600"
                                >
                                    <span>
                                        {formatCurrency(line.from, maxCommissionCurrency)} –{' '}
                                        {line.to === null
                                            ? '∞'
                                            : formatCurrency(line.to, maxCommissionCurrency)}{' '}
                                        × {line.value}% on{' '}
                                        {formatCurrency(line.slice, maxCommissionCurrency)}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(line.portion, maxCommissionCurrency)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-1.5 mt-1.5 border-t border-gray-300 font-semibold text-gray-900">
                                <span>Total Commission</span>
                                <span className="text-[#D19F3E]">
                                    {formatCurrency(preview.total, maxCommissionCurrency)}
                                </span>
                            </div>
                        </div>
                    )}
                </div> */}
            </div>
        );
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings size={32} className="text-green-600" />
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Commission Settings
                            </h2>
                        </div>
                        <p className="text-gray-600">
                            Configure progressive, tier-based commissions independently for
                            sellers and bidders
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <div className="max-w-full mx-auto">
                            {/* Main card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                                <div className="bg-gradient-to-r from-slate-900 to-slate-950 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Global Commission Structure
                                    </h3>
                                    <p className="text-gray-300 text-sm">
                                        Progressive tier-based percentage commission
                                    </p>
                                </div>

                                {/* Status strip */}
                                <div className="flex flex-wrap items-center gap-2 p-6 border-b border-gray-200">
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isEnabled
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {isEnabled ? 'Active' : 'Disabled'}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Applies to: {appliesTo.join(' & ') || '—'}
                                    </span>
                                </div>

                                {/* Enable toggle */}
                                <div className="flex items-center justify-between bg-gray-50 rounded-lg mx-6 my-6 px-4 py-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Enable Commission
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            When disabled, no commission is charged on any
                                            transaction
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsEnabled((v) => !v)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-green-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Applies-to */}
                                <div className="px-6 pb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Apply Commission To
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleToggleParty('seller')}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${appliesTo.includes('seller')
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="font-medium">Sellers</span>
                                        </button>
                                        <button
                                            onClick={() => handleToggleParty('bidder')}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${appliesTo.includes('bidder')
                                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="font-medium">Bidders</span>
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        {appliesTo.length === 2
                                            ? 'Commission is charged to both sellers and bidders using their own tier lists below'
                                            : `Commission is charged to ${appliesTo.join(
                                                ' and '
                                            )} only`}
                                    </p>
                                </div>

                                {/* Optional cap */}
                                {/* <div className="px-6 pb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Optional Commission Cap (per party)
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Leave empty for no cap"
                                            value={maxCommissionAmount}
                                            onChange={(e) => setMaxCommissionAmount(e.target.value)}
                                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <select
                                            value={maxCommissionCurrency}
                                            onChange={(e) =>
                                                setMaxCommissionCurrency(e.target.value)
                                            }
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Applied independently to seller and bidder base
                                        commission. Featured premium (currently 0%) is added
                                        only to the seller, uncapped.
                                    </p>
                                </div> */}

                                {/* Tier editors */}
                                <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {renderTierEditor(
                                        sellerTiers,
                                        setSellerTiers,
                                        'Seller',
                                        User,
                                        appliesTo.includes('seller')
                                    )}
                                    {renderTierEditor(
                                        bidderTiers,
                                        setBidderTiers,
                                        'Bidder',
                                        Users,
                                        appliesTo.includes('bidder')
                                    )}
                                </div>

                                {/* Save */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Saving Changes...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                Save Commission Settings
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Info card */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                                        <AlertCircle size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                            How Progressive Tiered Commission Works
                                        </h3>
                                        <div className="space-y-2 text-sm text-blue-700">
                                            <p>
                                                • Commission is calculated <strong>progressively</strong> — each
                                                tier's rate applies only to the slice of the sale price
                                                that falls within that tier.
                                            </p>
                                            <p>
                                                • Example: for a €3,000 sale with tiers{' '}
                                                <em>0–1,000 → 15%, 1,000–2,000 → 10%, 2,000+ → 5%</em>,
                                                the commission is{' '}
                                                <strong>€150 + €100 + €50 = €300</strong>.
                                            </p>
                                            <p>
                                                • The first tier must start at <strong>0</strong>. Only
                                                the last tier can be open-ended (leave "To" empty).
                                                Tiers must be <strong>contiguous</strong> — no gaps, no
                                                overlaps.
                                            </p>
                                            <p>
                                                • <strong>Separate tier lists</strong> exist for sellers
                                                and bidders. Each party pays their own computed amount.
                                            </p>
                                            <p>
                                                • <strong>Featured premium</strong> (currently 0%) is added only to the{' '}
                                                <strong>seller's</strong> commission, never the bidder's.
                                            </p>
                                            <p>
                                                • Existing auctions keep the commission that was
                                                calculated when they were sold. Only future sales use the
                                                new structure.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
};

export default Commissions;