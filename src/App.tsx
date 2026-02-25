import {
    Box,
    Button,
    CssBaseline,
    Fab,
    IconButton,
    Paper, TextField,
    Tooltip
} from '@mui/material';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AccountPage from './components/account/AccountPage';
import EmailVerification from './components/auth/EmailVerification';
import GoogleAuthenticator from './components/auth/GoogleAuthenticator';
import Login from './components/auth/Login';
import NoteEditor from './components/editor/NoteEditor';
import Layout from './components/layout/Layout';
import CategoryDirectory from './components/notes/CategoryDirectory';
import NoteCategoryChips from './components/notes/NoteCategoryChips';
import { useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { Note } from './types/note';

function App() {
  const {
    user,
    loading: authLoading,
    handleLogin: handleGoogleLogin,
    handleEmailSignUp,
    handleEmailSignIn,
    handleSendVerificationEmail,
    handleUpdateProfile,
    handleLogout
  } = useAuth();
  const {
    notes, categories, loading: notesLoading, error: notesError, hasMore, fetchNotes,
    loadMoreNotes, resetNoteLimit, getNote, addNote, updateNote,
    deleteNote, addCategory
  } = useNotes(user?.uid);

  const { noteId, categoryId } = useParams<{ noteId?: string; categoryId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAccountPage = location.pathname === '/account';

  const [categoryTab, setCategoryTab] = useState('all');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);



  // Sync category state with URL
  useEffect(() => {
    if (categoryId) {
      setCategoryTab(categoryId);
    } else if (location.pathname === '/' || location.pathname === '/notes') {
      setCategoryTab('all');
    }
    // Note: if viewing a note directly, we keep the last selected category in the sidebar
  }, [categoryId, location.pathname]);

  // Initial Check for MFA Verification
  useEffect(() => {
    if (user) {
      const mfaVerifiedTime = localStorage.getItem(`mfa_verified_${user.uid}`);
      if (mfaVerifiedTime) {
        const SESSION_DURATION = 2 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        if (now - parseInt(mfaVerifiedTime) < SESSION_DURATION) {
          setIsVerified(true);
        } else {
          localStorage.removeItem(`mfa_verified_${user.uid}`);
        }
      }
    } else {
      setIsVerified(false);
    }
  }, [user]);

  // Reset note limit when category changes
  useEffect(() => {
    resetNoteLimit();
  }, [categoryTab, resetNoteLimit]);

  // Initial fetch of notes based on category state
  useEffect(() => {
    if (user && isVerified) {
      const unsubscribe = fetchNotes(categoryTab);
      return () => unsubscribe();
    }
  }, [categoryTab, fetchNotes, user, isVerified]);

  // Handle Note selection/loading from URL
  useEffect(() => {
    const loadNote = async () => {
      if (noteId && user) {
        if (activeNote && activeNote.id === noteId) return;

        const note = notes.find(n => n.id === noteId);
        if (note) {
          setActiveNote(note);
        } else {
          const fetchedNote = await getNote(noteId);
          if (fetchedNote) {
            setActiveNote(fetchedNote);
          } else {
            navigate(categoryTab === 'all' ? '/' : `/categories/${categoryTab}`);
          }
        }
      } else {
        setActiveNote(null);
      }
    };
    loadNote();
  }, [noteId, notes, getNote, navigate, categoryTab, activeNote, user]);

  const handleCategorySelect = (id: string) => {
    navigate(id === 'all' ? '/' : `/categories/${id}`);
  };

  const handleTogglePin = async (id: string, currentStatus: boolean) => {
    try {
      await updateNote(id, { isPinned: !currentStatus });
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  };

  const handleNoteSelect = (id: string) => {
    navigate(`/notes/${id}?category=${categoryTab}`);
  };

  const handleAddNote = async () => {
    const id = await addNote(categoryTab);
    navigate(`/notes/${id}?category=${categoryTab}`);
  };

  const handleSave = async () => {
    if (activeNote) {
      setIsSaving(true);
      await updateNote(activeNote.id, {
        title: activeNote.title,
        content: activeNote.content,
        categoryIds: activeNote.categoryIds
      });
      setIsSaving(false);
    }
  };

  const handleNoteCategoryChange = async (categoryIds: string[]) => {
    if (activeNote) {
      setActiveNote({ ...activeNote, categoryIds });
      await updateNote(activeNote.id, { categoryIds });
    }
  };


  const handleDeleteNote = async () => {
    if (activeNote) {
      const idToDelete = activeNote.id;
      const otherNotes = notes.filter(n => n.id !== idToDelete);

      if (otherNotes.length > 0) {
        // Select the first available note
        navigate(`/notes/${otherNotes[0].id}`);
      } else {
        setActiveNote(null);
        navigate(categoryTab === 'all' ? '/' : `/categories/${categoryTab}`);
      }

      await deleteNote(idToDelete);
    }
  };

  // Keyboard Shortcut: Ctrl + S to Save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNote, handleSave]);



  if (authLoading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
        <Loader2 size={48} className="animate-spin" color="#6366f1" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Login
        onGoogleLogin={handleGoogleLogin}
        onEmailSignIn={handleEmailSignIn}
        onEmailSignUp={handleEmailSignUp}
      />
    );
  }

  if (!user.emailVerified) {
    return (
      <EmailVerification
        email={user.email}
        onResend={handleSendVerificationEmail}
        onLogout={handleLogout}
      />
    );
  }

  if (!isVerified) {
    return (
      <GoogleAuthenticator
        user={user}
        onVerified={() => {
          localStorage.setItem(`mfa_verified_${user.uid}`, Date.now().toString());
          setIsVerified(true);
        }}
      />
    );
  }

  return (
    <>
      <CssBaseline />
      <Layout
        notes={notes}
        selectedNoteId={noteId || null}
        onNoteSelect={handleNoteSelect}
        onTogglePin={handleTogglePin}
        user={user}
        onProfileClick={() => navigate('/account')}
        hasMore={hasMore}
        onLoadMore={loadMoreNotes}
        loading={notesLoading}
        error={notesError}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {isAccountPage ? (
            <AccountPage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />
          ) : activeNote ? (
            <Paper
              elevation={0}
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 1,
                backgroundColor: 'background.paper',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  pb: 2,
                  gap: 1.5,
                  bgcolor: 'background.paper',
                  zIndex: 11,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                  <NoteCategoryChips
                    categories={categories}
                    selectedCategoryIds={activeNote.categoryIds || []}
                    onCategoryChange={handleNoteCategoryChange}
                    onAddCategory={addCategory}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.5 }}>
                    <IconButton onClick={handleDeleteNote} color="error" size="small">
                      <Trash2 size={20} />
                    </IconButton>
                    <Button
                      variant="contained"
                      startIcon={<Save size={18} />}
                      onClick={handleSave}
                      disabled={isSaving}
                      sx={{ whiteSpace: 'nowrap', minWidth: '90px' }}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Note Title"
                  value={activeNote.title}
                  onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
                  InputProps={{
                    disableUnderline: true,
                    style: {
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      color: 'inherit'
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      color: 'text.primary',
                      p: 0
                    }
                  }}
                />
              </Box>

              <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <NoteEditor
                  key={activeNote.id}
                  content={activeNote.content}
                  onChange={(content) => setActiveNote({ ...activeNote, content })}
                />
              </Box>
            </Paper>
          ) : (
            <CategoryDirectory categories={categories} onCategorySelect={(id) => handleCategorySelect(id || 'all')} />
          )}
        </Box>

        {!isAccountPage && (
          <Tooltip title="New Note" placement="left">
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleAddNote}
              sx={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s'
                }
              }}
            >
              <Plus size={28} />
            </Fab>
          </Tooltip>
        )}
      </Layout>
    </>
  );
}

export default App;
