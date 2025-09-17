# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Docker support with multi-stage builds
- GitHub Actions CI/CD pipeline
- Security scanning with Trivy
- Issue templates for bug reports and feature requests
- Comprehensive documentation

### Changed
- Updated README with Docker instructions
- Improved project structure for better maintainability

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Stockify
- Multi-platform support (Shutterstock, Adobe Stock)
- AI-powered metadata generation using Google Gemini
- Modern React UI with dark/light mode
- Drag and drop file upload
- Image preview with pagination
- Metadata editing capabilities
- CSV export functionality
- Retry logic for failed images
- Rate limit management
- Toast notifications
- Responsive design

### Features
- **Platform Support**: Shutterstock and Adobe Stock
- **AI Models**: Gemini 2.5 Flash-Lite, Gemini 2.0 Flash-Lite, Gemini 1.5 Pro
- **File Formats**: JPG, PNG, WebP
- **Batch Processing**: Multiple images at once
- **Validation**: Platform-specific validation rules
- **Export**: CSV files ready for platform upload

### Technical
- React 18 with functional components and hooks
- Tailwind CSS for styling
- Google Gemini Multimodal API integration
- Local storage for rate limit tracking
- Responsive grid layout
- Keyboard navigation support
- Error handling and edge cases

## [0.9.0] - 2024-01-XX

### Added
- Basic image upload functionality
- Simple metadata generation
- CSV export
- Basic UI components

### Changed
- Initial development version

## [0.8.0] - 2024-01-XX

### Added
- Project setup
- Basic React structure
- Initial component architecture

---

## Version History

- **v1.0.0**: Full-featured release with multi-platform support
- **v0.9.0**: Beta version with core functionality
- **v0.8.0**: Alpha version with basic structure

## Migration Guide

### From v0.9.0 to v1.0.0

1. **New Dependencies**: Update to React 18 and latest Tailwind CSS
2. **API Changes**: Gemini API integration requires new environment variables
3. **UI Updates**: New dark mode and improved responsive design
4. **Platform Support**: Added Adobe Stock alongside Shutterstock

### From v0.8.0 to v0.9.0

1. **File Structure**: Reorganized components and utilities
2. **State Management**: Improved state handling with hooks
3. **Error Handling**: Added comprehensive error management

## Breaking Changes

### v1.0.0
- Removed support for older React versions
- Changed API endpoint structure
- Updated CSV format for better platform compatibility

### v0.9.0
- Restructured component props
- Changed file upload handling
- Updated metadata format

## Deprecations

### v1.0.0
- Legacy CSV format (will be removed in v2.0.0)
- Old API endpoints (will be removed in v2.0.0)

## Security

### v1.0.0
- Added input validation for all user inputs
- Implemented rate limiting for API calls
- Added security headers for production builds
- Regular dependency updates

## Performance

### v1.0.0
- Optimized image processing with lazy loading
- Improved memory management for large batches
- Added pagination for better performance
- Reduced bundle size with code splitting

## Dependencies

### v1.0.0
- React: ^18.2.0
- Tailwind CSS: ^3.3.0
- Node.js: ^18.0.0
- Docker: ^24.0.0

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) format and [Semantic Versioning](https://semver.org/) principles.
