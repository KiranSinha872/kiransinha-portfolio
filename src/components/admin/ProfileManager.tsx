'use client';

import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/lib/services/firestore';
import { uploadResumeFile } from '@/lib/services/storage';
import { useToast } from '@/components/ui/Toast';
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
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

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
        setLoading(true);
        const data = await getProfile();
        if (data) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            name: data.name || '',
            title: data.title || '',
            headline: data.headline || '',
            tagline: data.tagline || '',
            bio: data.bio || '',
            about: data.about || '',
            location: data.location || '',
            focusArea: data.focusArea || '',
            mindset: data.mindset || '',
            avatarUrl: data.avatarUrl || '',
            resumeUrl: data.resumeUrl || '',
            email: data.email || '',
            contactEmail: data.contactEmail || '',
            phone: data.phone || '',
            linkedinUrl: data.linkedinUrl || '',
            githubUrl: data.githubUrl || '',
            leetcodeUrl: data.leetcodeUrl || '',
            codechefUrl: data.codechefUrl || '',
            codeforcesUrl: data.codeforcesUrl || '',
            socials: Array.isArray(data.socials) ? data.socials : [],
          }));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        showToast('error', 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

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
      showToast('success', 'Resume document uploaded successfully.');
    } catch (err) {
      console.error('Resume upload error:', err);
      showToast('error', 'Failed to upload resume document.');
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      showToast('error', 'Display name is required.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name: formData.name.trim(),
        title: formData.title?.trim() || '',
        headline: formData.headline?.trim() || '',
        tagline: formData.tagline?.trim() || '',
        bio: formData.bio?.trim() || '',
        about: formData.about?.trim() || '',
        location: formData.location?.trim() || '',
        focusArea: formData.focusArea?.trim() || '',
        mindset: formData.mindset?.trim() || '',
        avatarUrl: formData.avatarUrl || '',
        resumeUrl: formData.resumeUrl || '',
        email: formData.email?.trim() || '',
        contactEmail: formData.contactEmail?.trim() || '',
        phone: formData.phone?.trim() || '',
        linkedinUrl: formData.linkedinUrl?.trim() || '',
        githubUrl: formData.githubUrl?.trim() || '',
        leetcodeUrl: formData.leetcodeUrl?.trim() || '',
        codechefUrl: formData.codechefUrl?.trim() || '',
        codeforcesUrl: formData.codeforcesUrl?.trim() || '',
        socials: (formData.socials || []).filter(
          (s): s is SocialLink => Boolean(s.platform?.trim() && s.url?.trim())
        ),
      });

      showToast('success', 'Profile details saved successfully.');
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
        <h2 className="text-lg font-bold text-gray-900">Profile & Resume</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Update your public profile details, headline, biography, and resume document.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resume Media Section */}
        <ProfileMediaSection
          formData={formData}
          uploadingResume={uploadingResume}
          onResumeUpload={handleResumeUpload}
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
            disabled={saving || uploadingResume}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
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
