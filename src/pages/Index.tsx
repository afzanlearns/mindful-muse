import { motion } from 'framer-motion';
import { NotesSidebar } from '@/components/NotesSidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { useNotes } from '@/hooks/useNotesSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet';
import { ThemeProvider } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { LogOut, Loader2, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const {
    filteredNotes,
    activeNote,
    activeNoteId,
    selectedTag,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    toggleTag,
    filterByTag,
  } = useNotes();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SidebarContent = (
    <NotesSidebar
      notes={filteredNotes}
      activeNoteId={activeNoteId}
      selectedTag={selectedTag}
      onSelectNote={selectNote}
      onCreateNote={createNote}
      onDeleteNote={deleteNote}
      onFilterByTag={filterByTag}
      className="w-full border-r-0"
      additionalHeaderAction={
        <SheetClose asChild>
          <Button variant="ghost" size="icon-sm" className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </SheetClose>
      }
    />
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Helmet>
        <title>Mindful Muse - Modern Note-Taking App</title>
        <meta name="description" content="Mindful Muse is your modern note-taking companion. Write, organize, and access your notes from anywhere with secure cloud storage." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex h-screen bg-background overflow-hidden"
      >
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full">
          <NotesSidebar
            notes={filteredNotes}
            activeNoteId={activeNoteId}
            selectedTag={selectedTag}
            onSelectNote={selectNote}
            onCreateNote={createNote}
            onDeleteNote={deleteNote}
            onFilterByTag={filterByTag}
          />
        </div>

        {/* Mobile Sidebar (Sheet) */}
        <Sheet>
          <SheetContent side="left" className="p-0 w-80 [&>button]:hidden">
            <SheetTitle className="hidden">Navigation Menu</SheetTitle>
            <SheetDescription className="hidden">
              Access your notes and settings.
            </SheetDescription>
            {SidebarContent}
          </SheetContent>

          <div className="flex-1 flex flex-col">
            {/* Header with user info and logout */}
            <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-2">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <div className="text-sm text-muted-foreground hidden sm:block">
                  {user?.email}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            <NoteEditor
              note={activeNote}
              onUpdateNote={updateNote}
              onToggleTag={toggleTag}
            />
          </div>
        </Sheet>
      </motion.div>
    </ThemeProvider>
  );
};

export default Index;