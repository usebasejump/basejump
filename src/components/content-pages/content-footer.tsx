const ContentFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="max-w-7xl mx-auto py-12 flex flex-col md:flex-row justify-center items-center content-center gap-4">
        <p>Your footer - the place you put footery things</p>
        <p className="hidden md:block">&bull;</p>
        <p>&copy; {year} usebasejump.com</p>
      </div>
    </footer>
  );
};
export default ContentFooter;
