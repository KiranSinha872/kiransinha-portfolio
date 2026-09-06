'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getProfile, updateProfile } from '@/lib/firestore';
import { uploadFileToStorage, uploadResumeFile } from '@/lib/storage';
import { useToast } from './Toast';
import ImageCropModal from './ImageCropModal';
import ResumeViewerModal from '@/components/public/ResumeViewerModal';
import type { Profile } from '@/types';
import {
  User,
  Upload,
  Loader2,
  Save,
  MapPin,
  FileText,
  Eye,
  Download,
  Trash2,
  Mail,
  Phone,
  Terminal,
  Award,
  Flame,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { LinkedInIcon, GitHubIcon } from '@/components/public/PlatformIcons';
import type { SocialLink } from '@/types';

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
        {/* Profile Picture Section */}
        <div className="p-4 border border-gray-200 rounded bg-gray-50 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-24 h-24 rounded border border-gray-300 overflow-hidden bg-white shrink-0 flex items-center justify-center">
            {formData.avatarUrl ? (
              <Image
                src={formData.avatarUrl}
                alt="Profile avatar preview"
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
            {uploadingImage && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xs font-semibold text-gray-800">Avatar Photo</h3>
            <p className="text-[11px] text-gray-500">
              Upload and crop a portrait photo.
            </p>
            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-100 rounded">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Uploading...' : 'Choose Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {formData.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: '' }))}
                  className="px-2 py-1 text-xs text-red-600 hover:underline"
                >
                  Remove Picture
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Kiran Sinha"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Professional Title / Tagline
            </label>
            <p className="text-[11px] text-gray-500 mb-1.5">
              Tagline displayed across the site (Hero section, site Footer, and SEO title).
            </p>
            <input
              type="text"
              value={formData.title || formData.headline || formData.tagline || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                  headline: e.target.value,
                  tagline: e.target.value,
                })
              }
              placeholder="e.g. B.Tech AI/ML Student | Aspiring Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Resume Upload */}
          <div className="sm:col-span-2 p-4 border border-gray-200 rounded bg-gray-50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume Document (PDF)</span>
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Upload your latest resume PDF.
                </p>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs rounded hover:bg-gray-800">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingResume ? 'Uploading...' : formData.resumeUrl ? 'Replace Resume PDF' : 'Upload Resume (PDF)'}</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>
            </div>

            {/* If Resume Attached */}
            {formData.resumeUrl && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 border border-gray-200 rounded bg-white text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-800">Resume PDF Attached</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setResumeModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <a
                    href={formData.resumeUrl}
                    download="Kiran_Sinha_Resume.pdf"
                    className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, resumeUrl: '' }))}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Remove Resume"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Split Bio & About Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Bio (Hero Section)
            </label>
            <p className="text-[11px] text-gray-500 mb-1.5">
              Short intro displayed under your name and title in the top Hero header.
            </p>
            <textarea
              rows={4}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="e.g. Building robust, accessible, and performant web products with Next.js, TypeScript, and modern cloud architectures."
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              About (About Section)
            </label>
            <p className="text-[11px] text-gray-500 mb-1.5">
              Comprehensive story and background for the scroll-reveal About section.
            </p>
            <textarea
              rows={4}
              value={formData.about || ''}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              placeholder="e.g. I am a first-year B.Tech student specializing in Artificial Intelligence & Machine Learning..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500 leading-relaxed"
            />
          </div>
        </div>

        {/* About Section Highlight Badges */}
        <div className="p-4 border border-gray-200 rounded bg-gray-50 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-800">About Section Highlight Badges</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Customize the three pill badges displayed at the bottom of the About section.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#4B6B94]" />
                <span>Badge 1: Location</span>
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Delhi"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Displays as: &quot;Based in {formData.location || 'Delhi'}&quot;</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Badge 2: Specialization</span>
              </label>
              <input
                type="text"
                value={formData.focusArea || ''}
                onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })}
                placeholder="e.g. Full-Stack & Cloud Architecture"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Displays as: &quot;{formData.focusArea || 'Full-Stack & Cloud Architecture'}&quot;</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#4B6B94]" />
                <span>Badge 3: Mindset / Trait</span>
              </label>
              <input
                type="text"
                value={formData.mindset || ''}
                onChange={(e) => setFormData({ ...formData, mindset: e.target.value })}
                placeholder="e.g. Continuous Learner"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Displays as: &quot;{formData.mindset || 'Continuous Learner'}&quot;</p>
            </div>
          </div>
        </div>

        {/* Contact & Connect Links */}
        <div className="p-4 border border-gray-200 rounded bg-gray-50 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-800">Contact Details & Socials</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              These links appear in the &quot;Let&apos;s Connect&quot; / Contact section. Empty fields will be hidden on the public site.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span>Primary Email Address</span>
              </label>
              <input
                type="email"
                value={formData.email || formData.contactEmail || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                    contactEmail: e.target.value,
                  })
                }
                placeholder="e.g. sinhakiran872@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <LinkedInIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn Profile URL</span>
              </label>
              <input
                type="url"
                value={formData.linkedinUrl || ''}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Coding & Competitive Programming Profiles */}
        <div className="p-4 border border-gray-200 rounded bg-gray-50 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-800">Coding Profiles & Competitive Programming</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              These profiles will be featured in the dedicated &quot;Coding Profiles&quot; section. Empty fields will be hidden automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <GitHubIcon className="w-3.5 h-3.5 text-gray-800" />
                <span>GitHub Profile URL</span>
              </label>
              <input
                type="url"
                value={formData.githubUrl || ''}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-amber-500" />
                <span>LeetCode Profile URL</span>
              </label>
              <input
                type="url"
                value={formData.leetcodeUrl || ''}
                onChange={(e) => setFormData({ ...formData, leetcodeUrl: e.target.value })}
                placeholder="https://leetcode.com/u/username"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>CodeChef Profile URL</span>
              </label>
              <input
                type="url"
                value={formData.codechefUrl || ''}
                onChange={(e) => setFormData({ ...formData, codechefUrl: e.target.value })}
                placeholder="https://codechef.com/users/username"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>Codeforces Profile URL</span>
              </label>
              <input
                type="url"
                value={formData.codeforcesUrl || ''}
                onChange={(e) => setFormData({ ...formData, codeforcesUrl: e.target.value })}
                placeholder="https://codeforces.com/profile/username"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>
        </div>

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
