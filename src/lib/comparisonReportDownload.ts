import { comparisonReportCsv, type ComparisonReport } from './comparisonReport';

export function downloadComparisonCsv(report: ComparisonReport) {
    const url = URL.createObjectURL(new Blob([comparisonReportCsv(report.snapshot)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `namemongkol-comparison-${report.id}.csv`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Capture the saved snapshot with locally embedded Thai fonts and prefer row/paragraph page breaks.
export async function downloadComparisonPdf(report: ComparisonReport, element: HTMLElement) {
    const [{ toCanvas }, { default: jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);
    const fonts = await Promise.all(['thai', 'latin'].map(async subset => {
        const response = await fetch(`/fonts/noto-sans-thai-${subset}-400.woff`);
        if (!response.ok) throw new Error('Font unavailable');
        const blob = await response.blob();
        const data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob);
        });
        const unicodeRange = subset === 'thai' ? 'U+0E00-0E7F' : 'U+0000-00FF,U+2000-206F';
        const face = new FontFace('ComparisonThai', `url(${data})`, { unicodeRange });
        document.fonts.add(await face.load());
        return `@font-face{font-family:ComparisonThai;src:url(${data}) format('woff');unicode-range:${unicodeRange};}`;
    }));
    await document.fonts.ready;
    const canvas = await toCanvas(element, { pixelRatio: 1.5, backgroundColor: '#faf9fd', fontEmbedCSS: fonts.join('\n'), cacheBust: false });
    if (!canvas.width || !canvas.height) throw new Error('Empty report');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape', compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const scale = canvas.width / element.getBoundingClientRect().width;
    const origin = element.getBoundingClientRect().top;
    const breaks = [...element.querySelectorAll('tr, p, h3, h4, dt, dd')].map(item => Math.ceil((item.getBoundingClientRect().bottom - origin) * scale) + 2).sort((a, b) => a - b);
    const pagePixels = Math.floor(canvas.width * (pageHeight - 20) / (pageWidth - 20));
    for (let top = 0; top < canvas.height;) {
        const max = Math.min(top + pagePixels, canvas.height);
        const candidates = breaks.filter(point => point > top + pagePixels * 0.35 && point <= max);
        const end = max === canvas.height ? max : candidates.at(-1) ?? max;
        const slice = document.createElement('canvas');
        slice.width = canvas.width; slice.height = end - top;
        const context = slice.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');
        context.drawImage(canvas, 0, top, slice.width, slice.height, 0, 0, slice.width, slice.height);
        if (top > 0) pdf.addPage();
        pdf.addImage(slice.toDataURL('image/jpeg', 0.94), 'JPEG', 10, 10, pageWidth - 20, slice.height * (pageWidth - 20) / slice.width);
        top = end;
    }
    pdf.save(`namemongkol-comparison-${report.id}.pdf`);
}
