# Maili Server

Send many emails with one touch.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- Send emails using API endpoint.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed
- Gmail account for Nodemailer (or update the email service configuration accordingly)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/zero-stealth/maili-api.git
    ```

2. Change into the project directory:

    ```bash
    cd maili-api
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

## Configuration

1. Create a `.env` file in the project root and add the following environment variables:

    ```env
    PORT=3000
    EMAIL=your_email@gmail.com
    PASSWORD=your_email_app_password
    ```

    Replace `your_email@gmail.com` and `your_email_app_password` with your Gmail account credentials.

2. Save the file.

## Usage

To start the server, run:

```bash
nodemon app.js
