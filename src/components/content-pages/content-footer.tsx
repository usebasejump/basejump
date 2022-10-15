const ContentFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="max-w-7xl mx-auto py-12 flex justify-center items-center content-center gap-x-4">
        <p>Your footer - the place you put footery things</p>
        <p>&bull;</p>
        <p>&copy; {year} usebasejump.com</p>
      </div>
    </footer>
  );
};
export default ContentFooter;
