import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePrivy } from '@privy-io/react-auth';
import Swal from 'sweetalert2';

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; bio: string }) => void;
  initialData: { name: string; bio: string };
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState(initialData.name);
  const [bio, setBio] = useState(initialData.bio);
  const [isLoading, setIsLoading] = useState(false);
  const { getAccessToken } = usePrivy();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      Swal.fire({
        title: 'Updating profile...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const token = await getAccessToken();
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio }),
      });

      if (response.ok) {
        Swal.close();
        onSave({ name, bio });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-cyan-400 border-2 border-cyan-400">
        <DialogHeader>
          <DialogTitle className="text-fuchsia-400">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-gray-800 text-cyan-200"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="bio" className="text-right">
              Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="col-span-3 bg-gray-800 text-cyan-200"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;