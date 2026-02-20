import { useState, useEffect } from 'react';
import {
  ThemeProvider, CssBaseline, Box, Paper, TextField,
  IconButton, Typography, Button, Divider, List,
  ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import theme from './theme/theme';
import Layout from './components/layout/Layout';
import NoteEditor from './components/editor/NoteEditor';
import { useNotes } from './hooks/useNotes';
import { Note } from './types/note';
import { Trash2, Plus, Save, Paperclip, ExternalLink, X, Loader2 } from 'lucide-react';
import Login from './components/auth/Login';
import GoogleAuthenticator from './components/auth/GoogleAuthenticator';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading: authLoading, handleLogin, handleLogout } = useAuth();
  const {
    notes, categories, fetchNotes, getNote, addNote,
    updateNote, deleteNote, addCategory, uploadFile
  } = useNotes(user?.uid);

  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryTab = searchParams.get('category') || 'all';

  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

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

  // Initial fetch of notes based on category in URL
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
            navigate(`/?category=${categoryTab}`);
          }
        }
      } else {
        setActiveNote(null);
      }
    };
    loadNote();
  }, [noteId, notes, getNote, navigate, categoryTab, activeNote, user]);

  const handleCategorySelect = (id: string) => {
    setSearchParams({ category: id });
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
        attachments: activeNote.attachments || []
      });
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeNote) {
      const file = e.target.files[0];
      const attachment = await uploadFile(activeNote.id, file);
      const updatedAttachments = [...(activeNote.attachments || []), attachment];
      setActiveNote({ ...activeNote, attachments: updatedAttachments });
      await updateNote(activeNote.id, { attachments: updatedAttachments });
    }
  };

  const removeAttachment = async (index: number) => {
    if (activeNote && activeNote.attachments) {
      const updatedAttachments = activeNote.attachments.filter((_, i) => i !== index);
      setActiveNote({ ...activeNote, attachments: updatedAttachments });
      await updateNote(activeNote.id, { attachments: updatedAttachments });
    }
  };

  const handleDeleteNote = async () => {
    if (activeNote) {
      const idToDelete = activeNote.id;
      setActiveNote(null);
      navigate(`/?category=${categoryTab}`);
      await deleteNote(idToDelete);
    }
  };

  const currentCategory = categories.find(c => c.id === categoryTab) || null;

  if (authLoading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Loader2 size={48} className="animate-spin" color="#6366f1" />
      </Box>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout
        categories={categories}
        selectedCategoryId={categoryTab}
        onCategorySelect={handleCategorySelect}
        onAddCategory={() => {
          const name = window.prompt('Category Name');
          if (name) addCategory(name);
        }}
        onAddNote={handleAddNote}
        currentCategory={currentCategory}
        notes={notes}
        selectedNoteId={noteId || null}
        onNoteSelect={handleNoteSelect}
        user={user}
        onLogout={() => {
          localStorage.removeItem(`mfa_verified_${user?.uid}`);
          setIsVerified(false);
          handleLogout();
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {activeNote ? (
            <Paper
              elevation={0}
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                backgroundColor: '#fff',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 3,
                  gap: 2,
                  bgcolor: '#fff',
                  zIndex: 11,
                  borderBottom: '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                }}
              >
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Note Title"
                  value={activeNote.title}
                  onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: '1.75rem', fontWeight: 700 }
                  }}
                />
                <IconButton onClick={handleDeleteNote} color="error">
                  <Trash2 size={20} />
                </IconButton>
                <Button
                  variant="contained"
                  startIcon={<Save size={18} />}
                  onClick={handleSave}
                  disabled={isSaving}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </Box>

              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                <Box sx={{ mb: 4 }}>
                  <NoteEditor
                    key={activeNote.id}
                    content={activeNote.content}
                    onChange={(content) => setActiveNote({ ...activeNote, content })}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Attachments</Typography>
                    <Button
                      component="label"
                      variant="text"
                      size="small"
                      startIcon={<Paperclip size={16} />}
                    >
                      Add File
                      <input type="file" hidden onChange={handleFileUpload} />
                    </Button>
                  </Box>
                  <List dense>
                    {activeNote.attachments?.map((file, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          backgroundColor: '#f1f5f9',
                          borderRadius: 1,
                          mb: 0.5,
                          '&:hover .remove-btn': { opacity: 1 }
                        }}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            className="remove-btn"
                            sx={{ opacity: 0, transition: '0.2s' }}
                            onClick={() => removeAttachment(index)}
                          >
                            <X size={16} />
                          </IconButton>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Paperclip size={18} />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(1)} KB`}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        />
                        <IconButton
                          size="small"
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ ml: 1 }}
                        >
                          <ExternalLink size={16} />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                gap: 2
              }}
            >
              <Typography variant="h5">Select a note to start editing</Typography>
              <Button
                variant="outlined"
                startIcon={<Plus size={20} />}
                onClick={handleAddNote}
              >
                Create new note
              </Button>
            </Box>
          )}
        </Box>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
