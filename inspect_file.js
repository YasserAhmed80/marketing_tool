import XLSX from 'xlsx';

const files = [
    'src/public/files/848410798-الشركات-العقارية-المؤهلة-لدى-وافي.xlsx',
    'src/public/files/858616691-عقار.xlsx',
    'src/public/files/875993477-Real-Estate-Companies-Aligned.xlsx'
];

files.forEach(file => {
    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📄 File: ${file.split('/').pop()}`);
        console.log('='.repeat(60));

        const workbook = XLSX.readFile(file);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length > 0) {
            console.log(`\n📊 Total rows: ${data.length}`);
            console.log(`\n📋 Columns found:`);
            console.log(Object.keys(data[0]).join(', '));

            console.log(`\n📝 First 3 rows:`);
            data.slice(0, 3).forEach((row, i) => {
                console.log(`\nRow ${i + 1}:`);
                console.log(JSON.stringify(row, null, 2));
            });
        } else {
            console.log('⚠️  No data found');
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
});
