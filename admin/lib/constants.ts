export interface PresetDivision {
    category: string;
    divisionName: string;
    displayName?: string; // Custom display name override
    description?: string; // Detailed description
}

export interface DivisionPreset {
    id: string;
    label: string;
    description: string;
    divisions: PresetDivision[];
}

export const DIVISION_PRESETS: DivisionPreset[] = [
    {
        id: 'GENERAL_ABC',
        label: '?¼ë°˜ë¶€ (A/B/Cì¡?',
        description: '?±ì¸ ?™í˜¸???˜ì?ë³?ë¦¬ê·¸',
        divisions: [
            { category: '?¼ë°˜ë¶€', divisionName: 'Aì¡?, displayName: 'Aì¡?(ìµœìƒ??', description: '? ìˆ˜ì¶œì‹  2ëª?ë³´ìœ , 1ëª?ì¶œì „ ê°€?? },
            { category: '?¼ë°˜ë¶€', divisionName: 'Bì¡?, displayName: 'Bì¡?(ì¤‘ê¸‰)', description: '? ìˆ˜ì¶œì‹  ë¶ˆê?, ?œìˆ˜ ?„ë§ˆì¶”ì–´' },
            { category: '?¼ë°˜ë¶€', divisionName: 'Cì¡?, displayName: 'Cì¡?(ì´ˆê¸‰)', description: 'êµ¬ë ¥ 3??ë¯¸ë§Œ ê¶Œì¥' },
        ]
    },
    {
        id: 'YOUTH_I_LEAGUE',
        label: '? ì†Œ??i-League ?œì?',
        description: 'ì´ˆë“±ë¶€(1~6?™ë…„) + ì¤‘ë“±ë¶€',
        divisions: [
            { category: '? ì†Œ??, divisionName: 'i1', displayName: '1?™ë…„ë¶€', description: 'U7 (ì´ˆë“±?™êµ 1?™ë…„ ?´í•˜)' },
            { category: '? ì†Œ??, divisionName: 'i2', displayName: '2?™ë…„ë¶€', description: 'U8 (ì´ˆë“±?™êµ 2?™ë…„ ?´í•˜)' },
            { category: '? ì†Œ??, divisionName: 'i3', displayName: '3?™ë…„ë¶€', description: 'U9 (ì´ˆë“±?™êµ 3?™ë…„ ?´í•˜)' },
            { category: '? ì†Œ??, divisionName: 'i4', displayName: '4?™ë…„ë¶€', description: 'U10 (ì´ˆë“±?™êµ 4?™ë…„ ?´í•˜)' },
            { category: '? ì†Œ??, divisionName: 'i5', displayName: '5?™ë…„ë¶€', description: 'U11 (ì´ˆë“±?™êµ 5?™ë…„ ?´í•˜)' },
            { category: '? ì†Œ??, divisionName: 'i6', displayName: '6?™ë…„ë¶€', description: 'U12 (ì´ˆë“±?™êµ 6?™ë…„ ?´í•˜)' },
            { category: '? ì†Œ??, divisionName: 'm1', displayName: 'ì¤‘ë“± 1?™ë…„ë¶€', description: 'U13 (ì¤‘í•™êµ?1?™ë…„ ?´í•˜)' },
        ]
    },
    {
        id: 'YOUTH_GIRLS',
        label: '? ì†Œ???¬í•™?ë?',
        description: 'ì´ˆë“± ?¬í•™?ë? (1~6?™ë…„)',
        divisions: [
            { category: '? ì†Œ????', divisionName: 'i1w', displayName: '1?™ë…„ë¶€ (??', description: 'U7 Girls' },
            { category: '? ì†Œ????', divisionName: 'i2w', displayName: '2?™ë…„ë¶€ (??', description: 'U8 Girls' },
            { category: '? ì†Œ????', divisionName: 'i3w', displayName: '3?™ë…„ë¶€ (??', description: 'U9 Girls' },
            { category: '? ì†Œ????', divisionName: 'i4w', displayName: '4?™ë…„ë¶€ (??', description: 'U10 Girls' },
            { category: '? ì†Œ????', divisionName: 'i5w', displayName: '5?™ë…„ë¶€ (??', description: 'U11 Girls' },
            { category: '? ì†Œ????', divisionName: 'i6w', displayName: '6?™ë…„ë¶€ (??', description: 'U12 Girls' },
        ]
    },
    {
        id: 'UNIVERSITY',
        label: '?€?™ë?',
        description: '?€?™êµ ?™ì•„ë¦?ë°??¬í•™??ë¦¬ê·¸',
        divisions: [
            { category: '?€?™ë?', divisionName: 'univ_1', displayName: '?€?™ë? 1ë¶€', description: 'ì²´ìœ¡?„ê³µ???¬í•¨ ê°€?? },
            { category: '?€?™ë?', divisionName: 'univ_2', displayName: '?€?™ë? 2ë¶€', description: '?œìˆ˜ ë¹„ì „ê³??¬í•™?? },
            { category: '?€?™ë?', divisionName: 'univ_f', displayName: '?€?™ë?(??', description: '?¬ì ?€?™ë?' },
        ]
    },
    {
        id: 'WOMEN_OPEN',
        label: '?¬ì„±ë¶€ (Open)',
        description: '?±ì¸ ?¬ì„± ?™í˜¸??ë¦¬ê·¸',
        divisions: [
            { category: '?¬ì„±ë¶€', divisionName: 'women_1', displayName: '?¬ì„±ë¶€ 1ë¶€', description: '?ìœ„ ?ˆë²¨ (? ì¶œ ?¬í•¨)' },
            { category: '?¬ì„±ë¶€', divisionName: 'women_2', displayName: '?¬ì„±ë¶€ 2ë¶€', description: 'ì¤‘ìœ„ ?ˆë²¨' },
            { category: '?¬ì„±ë¶€', divisionName: 'women_3', displayName: '?¬ì„±ë¶€ 3ë¶€', description: 'ì´ˆê¸‰/?…ë¬¸' },
        ]
    },
    {
        id: 'SENIOR',
        label: '?œë‹ˆ?´ë?',
        description: '?°ë ¹ë³??œë‹ˆ??ë¦¬ê·¸',
        divisions: [
            { category: '?œë‹ˆ??, divisionName: '40+', displayName: '40?€ë¶€', description: '1985???´ì „ ì¶œìƒ' },
            { category: '?œë‹ˆ??, divisionName: '50+', displayName: '50?€ë¶€', description: '1975???´ì „ ì¶œìƒ' },
            { category: '?œë‹ˆ??, divisionName: 'O.B', displayName: 'O.B ê°•í˜¸', description: 'ëª¨ë“  ?°ë ¹ ?µí•© (?´ë²¤??' },
        ]
    }
];

export function getDivisionDisplayName(code: string) {
    if (!code) return "";
    const match = code.match(/^i(\d+)(w?)$/i);
    if (match) {
        const grade = match[1];
        const isWomen = match[2].toLowerCase() === 'w';
        return `${grade}?™ë…„ë¶€${isWomen ? ' (?¬í•™??' : ''}`;
    }
    const matchM = code.match(/^m(\d+)$/i);
    if (matchM) {
        return `ì¤‘ë“± ${matchM[1]}?™ë…„ë¶€`;
    }
    if (code === '?˜ëª¨??) return '?˜ëª¨?ˆë¦¬ê·?(?€?™ë…„)';
    return code;
}
