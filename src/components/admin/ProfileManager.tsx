'use client';

import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/lib/services/firestore';
import { uploadFileToStorage, uploadResumeFile } from '@/lib/services/storage';
import { useToast } from '@/components/ui/Toast';
import ImageCropModal from '@/components/ui/ImageCropModal';
import ResumeViewerModal from '@/components/ui/ResumeViewerModal';
import ProfileMediaSection from '@/components/admin/ProfileMediaSection';
import ProfileBioSection from '@/components/admin/ProfileBioSection';
import ProfileBadgesSection from '@/components/admin/ProfileBadgesSection';
import ProfileSocialsSection from '@/components/admin/ProfileSocialsSection';
import type { Profile, SocialLink } from '@/types';
import { Loader2, Save } from 'lucide-react';

export default function ProfileManager() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<Partial<Profile>>({
    name: '',
    title: '',
    headline: '',
    tagline: '',
    bio: '',
    about: '',
    location: '',
    focusArea: '',
    mindset: '',
    avatarUrl: '',
    resumeUrl: '',
    email: '',
    contactEmail: '',
    phone: '',
    linkedinUrl: '',
    githubUrl: '',
    leetcodeUrl: '',
    codechefUrl: '',
    codeforcesUrl: '',
  });

  const handleFieldChange = (updates: Partial<Profile>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProfile();
        if (data) {
          const getSocial = (p: string) =>
            data.socials?.find((s) => s.platform.toLowerCase().includes(p.toLowerCase()))?.url || '';

          const fullAbout = data.about || data.bio || '';
          const condensedBio =
            data.about && data.bio
              ? data.bio
              : data.bio && data.bio.length > 180
              ? 'I am a passionate first-year B.Tech student in AI & ML, building robust full-stack applications, algorithms, and real-world software solutions.'
              : data.bio || '';

          const rawTitle = data.tagline || data.title || data.headline;
          const currentTagline =
            !rawTitle ||
            rawTitle === 'Full-Stack Software Engineer & Cloud Architect.' ||
            rawTitle === 'Full-Stack Software Engineer & Cloud Architect' ||
            rawTitle === 'Full-Stack Software Engineer' ||
            rawTitle === 'B.Tech AI/ML Student'
              ? 'B.Tech AI/ML Student | Aspiring Software Engineer'
              : rawTitle;

          setFormData({
            ...data,
            title: currentTagline,
            headline: currentTagline,
            tagline: currentTagline,
            bio: condensedBio,
            about: fullAbout,
            location: data.location !== undefined ? data.location : 'Delhi',
            focusArea: data.focusArea !== undefined ? data.focusArea : 'Full-Stack & Cloud Architecture',
            mindset: data.mindset !== undefined ? data.mindset : 'Continuous Learner',
            email: data.email || data.contactEmail || '',
            contactEmail: data.contactEmail || data.email || '',
            phone: data.phone || '',
            linkedinUrl: data.linkedinUrl || getSocial('link'),
            githubUrl: data.githubUrl || getSocial('git'),
            leetcodeUrl: data.leetcodeUrl || getSocial('leet'),
            codechefUrl: data.codechefUrl || getSocial('chef'),
            codeforcesUrl: data.codeforcesUrl || getSocial('force'),
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        showToast('error', 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setSelectedImageFile(file);
    setCropModalOpen(true);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File, previewUrl: string) => {
    setCropModalOpen(false);
    setSelectedImageFile(null);

    // Show preview immediately
    setFormData((prev) => ({ ...prev, avatarUrl: previewUrl }));

    try {
      setUploadingImage(true);
      const url = await uploadFileToStorage(croppedFile, 'avatars');
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      showToast('success', 'Profile image cropped and updated!');
    } catch (err) {
      console.error('Upload error:', err);
      showToast('error', 'Failed to process profile picture.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showToast('error', 'Please upload a PDF document (.pdf).');
      return;
    }

    try {
      setUploadingResume(true);
      const url = await uploadResumeFile(file);
      setFormData((prev) => ({ ...prev, resumeUrl: url }));
      showToast('success', 'Resume PDF uploaded and attached successfully!');
    } catch (err) {
      console.error('Resume upload error:', err);
      showToast('error', 'Failed to upload resume file.');
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('error', 'Full Name is required.');
      return;
    }

    setSaving(true);
    try {
      const updatedSocials = [
        formData.linkedinUrl ? { platform: 'LinkedIn', url: formData.linkedinUrl, label: 'LinkedIn' } : null,
        formData.githubUrl ? { platform: 'GitHub', url: formData.githubUrl, label: 'GitHub' } : null,
        formData.leetcodeUrl ? { platform: 'LeetCode', url: formData.leetcodeUrl, label: 'LeetCode' } : null,
        formData.codechefUrl ? { platform: 'CodeChef', url: formData.codechefUrl, label: 'CodeChef' } : null,
        formData.codeforcesUrl ? { platform: 'Codeforces', url: formData.codeforcesUrl, label: 'Codeforces' } : null,
      ].filter(Boolean) as SocialLink[];

      const taglineVal =
        formData.title?.trim() ||
        formData.headline?.trim() ||
        formData.tagline?.trim() ||
        'B.Tech AI/ML Student | Aspiring Software Engineer';

      const payload = {
        ...formData,
        title: taglineVal,
        headline: taglineVal,
        tagline: taglineVal,
        socials: updatedSocials,
        email: formData.email || formData.contactEmail || '',
        contactEmail: formData.contactEmail || formData.email || '',
      };

      await updateProfile(payload);
      showToast('success', 'Profile updated successfully in Firestore!');
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast('error', 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-lg font-bold text-gray-900">Profile & Picture</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Update your public profile details, headline, biography, and profile image.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture & Resume Media Section */}
        <ProfileMediaSection
          formData={formData}
          uploadingImage={uploadingImage}
          uploadingResume={uploadingResume}
          onImageChange={handleImageChange}
          onResumeUpload={handleResumeUpload}
          onRemoveAvatar={() => setFormData((prev) => ({ ...prev, avatarUrl: '' }))}
          onRemoveResume={() => setFormData((prev) => ({ ...prev, resumeUrl: '' }))}
          onPreviewResume={() => setResumeModalOpen(true)}
        />

        {/* Text Details & Bio */}
        <ProfileBioSection formData={formData} onChange={handleFieldChange} />

        {/* About Section Highlight Badges */}
        <ProfileBadgesSection formData={formData} onChange={handleFieldChange} />

        {/* Contact & Connect Links and Coding Profiles */}
        <ProfileSocialsSection formData={formData} onChange={handleFieldChange} />

        {/* Submit */}
        <div className="flex justify-end pt-3 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving || uploadingImage || uploadingResume}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Interactive Avatar Cropper Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageFile={selectedImageFile}
        initialAspectRatio="1:1"
        initialFitMode="cover"
        title="Crop & Center Avatar Photo"
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setCropModalOpen(false);
          setSelectedImageFile(null);
        }}
      />

      {/* Interactive Resume PDF Viewer Modal */}
      <ResumeViewerModal
        isOpen={resumeModalOpen}
        resumeUrl={formData.resumeUrl || ''}
        title={`${formData.name || 'Kiran Sinha'} - Resume`}
        onClose={() => setResumeModalOpen(false)}
      />
    </div>
  );
}
