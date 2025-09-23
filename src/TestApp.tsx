export default function TestApp() {
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'red', backgroundColor: 'yellow' }}>
      <h1>🎉 التطبيق يعمل!</h1>
      <p>React تم تحميله بنجاح</p>
      <p>اليوم: {new Date().toLocaleDateString('ar')}</p>
    </div>
  );
}