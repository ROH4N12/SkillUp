Design a modern web dashboard UI for an AI-Based Learning Path Generator platform. The UI should be structured so that it can be easily implemented using React.js component architecture.

The design should follow a component-based layout suitable for React with reusable UI elements.

Use a clean dashboard style, light background, card-based layout, and clear data visualizations.

Application Overview

The platform helps learners:

Discover suitable career paths

Identify skill gaps

Receive AI-based learning recommendations

Track learning progress

Get career readiness scores

Detect learning risks early

The system is used by:

Learners

Counselors

Trainers

Layout Structure (React Friendly)

Create a dashboard layout with reusable components.

Main structure:

App Layout

Sidebar Navigation Component

Top Navbar Component

Main Content Area

Sidebar Menu Items:

Dashboard

Learning Path

Skill Gap Analysis

Career Recommendations

Progress Tracking

Portfolio

Alerts

Industry Trends

Role Mapping

Settings

Navbar Components:

Search bar

Notifications

User profile dropdown

Screen 1: Authentication

Login / Register UI.

Components:

LoginForm component

Input fields (email, password)

Sign in button

Sign up link

Forgot password

Design style: minimal centered card.

Screen 2: Learner Dashboard

Display personalized learning insights.

React Components:

ReadinessScoreCard

SkillProgressChart

RecommendedRolesCard

LearningPathCard

SkillGapSummary

PortfolioProgress

AlertsWidget

Visual elements:

Progress bars

Charts

Summary cards

Screen 3: Personalized Learning Path

Shows AI-generated roadmap.

Components:

CareerGoalSelector

LearningRoadmapTimeline

CourseCard

CompletionTracker

Use timeline style UI.

Screen 4: Skill Gap Analysis

Shows difference between learner skills and job requirements.

Components:

SkillComparisonChart

MissingSkillsList

RecommendedCoursesCard

Use charts and comparison bars.

Screen 5: Career Recommendations

AI suggests suitable career roles.

Components:

RoleRecommendationCard

RoleMatchPercentage

SkillRequirementsList

LearningSuggestions

Each role displayed as card.

Screen 6: Progress Tracking

Track learner activity and performance.

Components:

ProgressLineChart

CompletionRateCard

LearningStreakIndicator

ActivityTimeline

Screen 7: Early Alert System

Detect struggling learners.

Components:

RiskAlertCard

RiskLevelIndicator

SuggestedActions

ActivityMonitor

Screen 8: Counselor Dashboard

Used to monitor multiple learners.

Components:

LearnerListTable

ReadinessScoreOverview

SkillGapAnalytics

PlacementReadinessCard

RiskAlertsPanel

Charts for learner distribution.

Screen 9: Trainer Dashboard

Track course effectiveness.

Components:

CourseCompletionStats

PerformanceAnalyticsChart

StrugglingLearnersList

CurriculumSuggestionPanel

Screen 10: Industry Alignment

Show industry skill demand.

Components:

TrendingSkillsChart

IndustryDemandGraph

EmergingRolesCards

CurriculumRecommendations

Screen 11: Role Mapping

Map learner skills to job roles.

Components:

LearnerSkillProfile

RoleMatchResults

MatchPercentageIndicator

ImprovementSuggestions

Design System

Color Palette:
Primary: Blue / Indigo
Secondary: Teal / Purple
Background: Light gray / white

Typography:
Modern sans-serif.

UI style:

Card based layout

Rounded corners

Soft shadows

Clear icons

Reusable React Components

Design reusable UI components:

Sidebar

Navbar

DashboardCard

ChartWidget

ProgressBar

AlertBanner

RoleCard

SkillBadge

CourseCard

Ensure components are modular and reusable for React development.