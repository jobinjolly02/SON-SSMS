USE [master]
GO
/****** Object:  Database [school_admissions]    Script Date: 20-06-2024 11:02:11 ******/
CREATE DATABASE [school_admissions]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'school_admissions', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\school_admissions.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'school_admissions_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\school_admissions_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [school_admissions] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [school_admissions].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [school_admissions] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [school_admissions] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [school_admissions] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [school_admissions] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [school_admissions] SET ARITHABORT OFF 
GO
ALTER DATABASE [school_admissions] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [school_admissions] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [school_admissions] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [school_admissions] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [school_admissions] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [school_admissions] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [school_admissions] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [school_admissions] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [school_admissions] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [school_admissions] SET  ENABLE_BROKER 
GO
ALTER DATABASE [school_admissions] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [school_admissions] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [school_admissions] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [school_admissions] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [school_admissions] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [school_admissions] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [school_admissions] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [school_admissions] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [school_admissions] SET  MULTI_USER 
GO
ALTER DATABASE [school_admissions] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [school_admissions] SET DB_CHAINING OFF 
GO
ALTER DATABASE [school_admissions] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [school_admissions] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [school_admissions] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [school_admissions] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [school_admissions] SET QUERY_STORE = ON
GO
ALTER DATABASE [school_admissions] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [school_admissions]
GO
/****** Object:  Schema [school_admissions]    Script Date: 20-06-2024 11:02:11 ******/
CREATE SCHEMA [school_admissions]
GO
/****** Object:  UserDefinedFunction [school_admissions].[enum2str$action_matrix$action_type]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[enum2str$action_matrix$action_type] 
( 
   @setval tinyint
)
RETURNS nvarchar(max)
AS 
   BEGIN
      RETURN 
         CASE @setval
            WHEN 1 THEN 'parallel'
            WHEN 2 THEN 'finance'
            WHEN 3 THEN 'nursing'
            ELSE ''
         END
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[enum2str$applications$gender]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[enum2str$applications$gender] 
( 
   @setval tinyint
)
RETURNS nvarchar(max)
AS 
   BEGIN
      RETURN 
         CASE @setval
            WHEN 1 THEN 'Male'
            WHEN 2 THEN 'Female'
            WHEN 3 THEN 'Other'
            ELSE ''
         END
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[enum2str$applications$maritalStatus]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[enum2str$applications$maritalStatus] 
( 
   @setval tinyint
)
RETURNS nvarchar(max)
AS 
   BEGIN
      RETURN 
         CASE @setval
            WHEN 1 THEN 'Married'
            WHEN 2 THEN 'Unmarried'
            ELSE ''
         END
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[enum2str$nurses$user_type]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[enum2str$nurses$user_type] 
( 
   @setval tinyint
)
RETURNS nvarchar(max)
AS 
   BEGIN
      RETURN 
         CASE @setval
            WHEN 1 THEN 'nursing'
            WHEN 2 THEN 'finance'
            ELSE ''
         END
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[norm_enum$action_matrix$action_type]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[norm_enum$action_matrix$action_type] 
( 
   @setval nvarchar(max)
)
RETURNS nvarchar(max)
AS 
   BEGIN
      RETURN school_admissions.enum2str$action_matrix$action_type(school_admissions.str2enum$action_matrix$action_type(@setval))
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[norm_enum$applications$gender]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[norm_enum$applications$gender] 
( 
   @setval nvarchar(max)
)
RETURNS nvarchar(max)
AS 
   BEGIN
      RETURN school_admissions.enum2str$applications$gender(school_admissions.str2enum$applications$gender(@setval))
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[norm_enum$applications$maritalStatus]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[norm_enum$applications$maritalStatus] 
( 
   @setval nvarchar(max)
)
RETURNS nvarchar(max)
AS 
   BEGIN
      RETURN school_admissions.enum2str$applications$maritalStatus(school_admissions.str2enum$applications$maritalStatus(@setval))
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[norm_enum$nurses$user_type]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[norm_enum$nurses$user_type] 
( 
   @setval nvarchar(max)
)
RETURNS nvarchar(max)
AS 
   BEGIN
      RETURN school_admissions.enum2str$nurses$user_type(school_admissions.str2enum$nurses$user_type(@setval))
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[str2enum$action_matrix$action_type]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[str2enum$action_matrix$action_type] 
( 
   @setval nvarchar(max)
)
RETURNS tinyint
AS 
   BEGIN
      RETURN 
         CASE @setval
            WHEN 'parallel' THEN 1
            WHEN 'finance' THEN 2
            WHEN 'nursing' THEN 3
            ELSE 0
         END
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[str2enum$applications$gender]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[str2enum$applications$gender] 
( 
   @setval nvarchar(max)
)
RETURNS tinyint
AS 
   BEGIN
      RETURN 
         CASE @setval
            WHEN 'Male' THEN 1
            WHEN 'Female' THEN 2
            WHEN 'Other' THEN 3
            ELSE 0
         END
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[str2enum$applications$maritalStatus]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[str2enum$applications$maritalStatus] 
( 
   @setval nvarchar(max)
)
RETURNS tinyint
AS 
   BEGIN
      RETURN 
         CASE @setval
            WHEN 'Married' THEN 1
            WHEN 'Unmarried' THEN 2
            ELSE 0
         END
   END
GO
/****** Object:  UserDefinedFunction [school_admissions].[str2enum$nurses$user_type]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [school_admissions].[str2enum$nurses$user_type] 
( 
   @setval nvarchar(max)
)
RETURNS tinyint
AS 
   BEGIN
      RETURN 
         CASE @setval
            WHEN 'nursing' THEN 1
            WHEN 'finance' THEN 2
            ELSE 0
         END
   END
GO
/****** Object:  Table [school_admissions].[action_matrix]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [school_admissions].[action_matrix](
	[id] [int] IDENTITY(4,1) NOT NULL,
	[action_type] [nvarchar](8) NOT NULL,
	[is_active] [smallint] NULL,
 CONSTRAINT [PK_action_matrix_id] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [school_admissions].[applications]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [school_admissions].[applications](
	[id] [int] IDENTITY(329,1) NOT NULL,
	[student_id] [nvarchar](255) NULL,
	[firstName] [nvarchar](100) NULL,
	[lastName] [nvarchar](100) NULL,
	[contactNumber] [nvarchar](15) NULL,
	[email] [nvarchar](100) NULL,
	[gender] [nvarchar](6) NULL,
	[studentPhoto] [nvarchar](255) NULL,
	[fathersFirstName] [nvarchar](100) NULL,
	[fathersLastName] [nvarchar](100) NULL,
	[fathersOccupation] [nvarchar](100) NULL,
	[mothersFirstName] [nvarchar](100) NULL,
	[mothersLastName] [nvarchar](100) NULL,
	[mothersOccupation] [nvarchar](100) NULL,
	[presentAddressLine1] [nvarchar](255) NULL,
	[presentAddressLine2] [nvarchar](255) NULL,
	[presentCity] [nvarchar](100) NULL,
	[presentState] [nvarchar](100) NULL,
	[presentPostalCode] [nvarchar](20) NULL,
	[presentCountry] [nvarchar](50) NULL,
	[correspondenceAddressLine1] [nvarchar](255) NULL,
	[correspondenceAddressLine2] [nvarchar](255) NULL,
	[correspondenceCity] [nvarchar](100) NULL,
	[correspondenceState] [nvarchar](100) NULL,
	[correspondencePostalCode] [nvarchar](20) NULL,
	[correspondenceCountry] [nvarchar](50) NULL,
	[guardianName] [nvarchar](100) NULL,
	[guardianRelationship] [nvarchar](100) NULL,
	[guardianContactNumber] [nvarchar](15) NULL,
	[guardianResidentialAddress] [nvarchar](255) NULL,
	[guardianOfficialAddress] [nvarchar](255) NULL,
	[religion] [nvarchar](50) NULL,
	[nationality] [nvarchar](50) NULL,
	[maritalStatus] [nvarchar](9) NULL,
	[dob] [date] NULL,
	[category] [nvarchar](50) NULL,
	[transactionId] [nvarchar](100) NULL,
	[class10SchoolName] [nvarchar](255) NULL,
	[class10BoardName] [nvarchar](255) NULL,
	[class10Year] [smallint] NULL,
	[class10Percentage] [real] NULL,
	[class10Subjects] [nvarchar](255) NULL,
	[class10Marks] [nvarchar](255) NULL,
	[class12SchoolName] [nvarchar](255) NULL,
	[class12BoardName] [nvarchar](255) NULL,
	[class12Year] [smallint] NULL,
	[class12Percentage] [real] NULL,
	[class12Subjects] [nvarchar](255) NULL,
	[class12Marks] [nvarchar](255) NULL,
	[additionalSubject] [nvarchar](255) NULL,
	[additionalSubjectMarks] [nvarchar](255) NULL,
	[academicSportsDistinction] [nvarchar](max) NULL,
	[transactionReceipt] [nvarchar](255) NULL,
	[class10Certificate] [nvarchar](255) NULL,
	[class12MarkSheet] [nvarchar](255) NULL,
	[studentPhotoName] [nvarchar](255) NULL,
	[class10CertificateName] [nvarchar](255) NULL,
	[class12MarkSheetName] [nvarchar](255) NULL,
	[remarks] [nvarchar](max) NULL,
	[status] [nvarchar](255) NULL,
	[approve_remarks] [nvarchar](max) NULL,
	[reject_reason] [nvarchar](max) NULL,
	[finance_status] [nvarchar](255) NULL,
	[finance_approve_remarks] [nvarchar](255) NULL,
	[finance_reject_reason] [nvarchar](max) NULL,
	[submissionDate] [datetime2](0) NOT NULL,
	[nursing_action_status] [smallint] NULL,
	[finance_action_status] [smallint] NULL,
 CONSTRAINT [PK_applications_id] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [applications$student_id] UNIQUE NONCLUSTERED 
(
	[student_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [school_admissions].[email_templates]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [school_admissions].[email_templates](
	[id] [int] IDENTITY(15,1) NOT NULL,
	[event_trigger] [nvarchar](255) NULL,
	[user_type] [nvarchar](255) NULL,
	[subject] [nvarchar](255) NULL,
	[body] [nvarchar](max) NULL,
 CONSTRAINT [PK_email_templates_id] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [school_admissions].[finance]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [school_admissions].[finance](
	[id] [int] IDENTITY(3,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[password] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_finance_id] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [finance$email] UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [school_admissions].[nurses]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [school_admissions].[nurses](
	[id] [int] IDENTITY(9,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[password] [nvarchar](255) NOT NULL,
	[reset_token] [nvarchar](255) NULL,
	[token_expiration] [datetime2](0) NULL,
	[user_type] [nvarchar](7) NOT NULL,
 CONSTRAINT [PK_nurses_id] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [nurses$email] UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [school_admissions].[user_types]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [school_admissions].[user_types](
	[id] [int] IDENTITY(5,1) NOT NULL,
	[type] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_user_types_id] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [user_types$type] UNIQUE NONCLUSTERED 
(
	[type] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [school_admissions].[users]    Script Date: 20-06-2024 11:02:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [school_admissions].[users](
	[id] [int] IDENTITY(14,1) NOT NULL,
	[username] [nvarchar](255) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[password] [nvarchar](255) NOT NULL,
	[user_type] [nvarchar](255) NOT NULL,
	[created_at] [datetime] NULL,
	[user_type_id] [int] NULL,
	[isActive] [smallint] NULL,
 CONSTRAINT [PK_users_id] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [users$email] UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [users$username_UNIQUE] UNIQUE NONCLUSTERED 
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [school_admissions].[action_matrix] ADD  DEFAULT ((0)) FOR [is_active]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [student_id]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [firstName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [lastName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [contactNumber]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [email]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [gender]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [studentPhoto]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [fathersFirstName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [fathersLastName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [fathersOccupation]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [mothersFirstName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [mothersLastName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [mothersOccupation]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [presentAddressLine1]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [presentAddressLine2]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [presentCity]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [presentState]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [presentPostalCode]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [presentCountry]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [correspondenceAddressLine1]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [correspondenceAddressLine2]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [correspondenceCity]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [correspondenceState]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [correspondencePostalCode]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [correspondenceCountry]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [guardianName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [guardianRelationship]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [guardianContactNumber]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [guardianResidentialAddress]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [guardianOfficialAddress]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [religion]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [nationality]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [maritalStatus]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [dob]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [category]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [transactionId]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class10SchoolName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class10BoardName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class10Year]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class10Percentage]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class10Subjects]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class10Marks]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class12SchoolName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class12BoardName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class12Year]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class12Percentage]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class12Subjects]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class12Marks]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [additionalSubject]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [additionalSubjectMarks]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [transactionReceipt]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class10Certificate]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class12MarkSheet]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [studentPhotoName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class10CertificateName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [class12MarkSheetName]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (N'PENDING') FOR [status]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (N'PENDING') FOR [finance_status]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (NULL) FOR [finance_approve_remarks]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT (getdate()) FOR [submissionDate]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT ((0)) FOR [nursing_action_status]
GO
ALTER TABLE [school_admissions].[applications] ADD  DEFAULT ((0)) FOR [finance_action_status]
GO
ALTER TABLE [school_admissions].[email_templates] ADD  DEFAULT (NULL) FOR [event_trigger]
GO
ALTER TABLE [school_admissions].[email_templates] ADD  DEFAULT (NULL) FOR [user_type]
GO
ALTER TABLE [school_admissions].[email_templates] ADD  DEFAULT (NULL) FOR [subject]
GO
ALTER TABLE [school_admissions].[nurses] ADD  DEFAULT (NULL) FOR [reset_token]
GO
ALTER TABLE [school_admissions].[nurses] ADD  DEFAULT (NULL) FOR [token_expiration]
GO
ALTER TABLE [school_admissions].[nurses] ADD  DEFAULT (N'nursing') FOR [user_type]
GO
ALTER TABLE [school_admissions].[users] ADD  DEFAULT (N'GAA0000') FOR [username]
GO
ALTER TABLE [school_admissions].[users] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [school_admissions].[users] ADD  DEFAULT (NULL) FOR [user_type_id]
GO
ALTER TABLE [school_admissions].[users] ADD  DEFAULT ((1)) FOR [isActive]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.action_matrix' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'enum2str$action_matrix$action_type'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.applications' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'enum2str$applications$gender'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.applications' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'enum2str$applications$maritalStatus'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.nurses' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'enum2str$nurses$user_type'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.action_matrix' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'norm_enum$action_matrix$action_type'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.applications' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'norm_enum$applications$gender'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.applications' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'norm_enum$applications$maritalStatus'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.nurses' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'norm_enum$nurses$user_type'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.action_matrix' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'str2enum$action_matrix$action_type'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.applications' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'str2enum$applications$gender'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.applications' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'str2enum$applications$maritalStatus'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.nurses' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'FUNCTION',@level1name=N'str2enum$nurses$user_type'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.action_matrix' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'TABLE',@level1name=N'action_matrix'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.applications' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'TABLE',@level1name=N'applications'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.email_templates' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'TABLE',@level1name=N'email_templates'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.finance' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'TABLE',@level1name=N'finance'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.nurses' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'TABLE',@level1name=N'nurses'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.user_types' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'TABLE',@level1name=N'user_types'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_SSMA_SOURCE', @value=N'school_admissions.users' , @level0type=N'SCHEMA',@level0name=N'school_admissions', @level1type=N'TABLE',@level1name=N'users'
GO
USE [master]
GO
ALTER DATABASE [school_admissions] SET  READ_WRITE 
GO
