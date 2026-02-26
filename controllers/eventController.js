const supabase = require("../config/supabase");

/* ===============================
   EVENTS LIST PAGE
================================ */
exports.getEventsPage = async (req, res) => {
  try {
    const today = new Date().toISOString();

    // AUTO MOVE UPCOMING → PAST
    await supabase
      .from('events')
      .update({ type: "past" })
      .eq('type', "upcoming")
      .lt('endDate', today);

    const { data: upcomingEvents } = await supabase
      .from('events')
      .select('*')
      .eq('type', "upcoming")
      .order('startDate', { ascending: true });

    const { data: pastEvents } = await supabase
      .from('events')
      .select('*')
      .eq('type', "past")
      .order('startDate', { ascending: false });

    res.render("events/index", {
      upcomingEvents: upcomingEvents || [],
      pastEvents: pastEvents || [],
    });
  } catch (error) {
    console.error("Events Page Error:", error);
    res.redirect("/");
  }
};

/* ===============================
   EVENT DETAIL PAGE
================================ */
exports.getEventDetail = async (req, res) => {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!event) return res.redirect("/events");

    const isPast = event.type === "past";

    // ✅ FETCH REVIEWS FOR PAST EVENTS
    let reviews = [];
    if (isPast) {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('event', event.id)
        .order('createdAt', { ascending: false });
      reviews = data || [];
    }

    res.render("events/show", {
      event,
      isPast,
      reviews, // ✅ VERY IMPORTANT
    });
  } catch (error) {
    console.error("Event Detail Error:", error);
    res.redirect("/events");
  }
};


/* ===============================
   ADD EVENT (ADMIN)
================================ */
exports.addEvent = async (req, res) => {
  try {
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);

    const {
      type,
      title,
      shortDescription,
      description,
      about,
      startDate,
      endDate,
      registrationLink,
    } = req.body;

    if (!title || !startDate || !endDate || !req.file) {
      console.log("❌ Missing required fields");
      return res.redirect("/events");
    }

    await supabase.from('events').insert([{
      type,
      title,
      shortDescription,
      description,
      about,
      startDate,
      endDate,
      bannerImage: `/uploads/events/${req.file.filename}`,
      registrationLink: type === "upcoming" ? registrationLink : null,
      galleryImages: [],
      conductedBy: [],
      contacts: [],
      prizes: [],
      documents: []
    }]);

    res.redirect("/events");
  } catch (error) {
    console.error("Add Event Error:", error);
    res.redirect("/events");
  }
};


/* ===============================
   EDIT EVENT PAGE (ADMIN)
================================ */
exports.getEditEvent = async (req, res) => {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!event) {
      return res.redirect("/events");
    }

    res.render("events/edit", { event });
  } catch (error) {
    console.error("Get Edit Event Error:", error);
    res.redirect("/events");
  }
};

/* ===============================
   UPDATE EVENT (ADMIN)
================================ */
exports.updateEvent = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      description,
      about,
      startDate,
      endDate,
      registrationLink,
    } = req.body;

    const updateData = {
      title,
      shortDescription,
      description,
      about,
      startDate,
      endDate,
    };

    if (req.file) {
      updateData.bannerImage = `/uploads/events/${req.file.filename}`;
    }

    // Only upcoming events can have registration
    const { data: event } = await supabase
      .from('events')
      .select('type')
      .eq('id', req.params.id)
      .single();

    if (event && event.type === "upcoming") {
      updateData.registrationLink = registrationLink;
    }

    await supabase
      .from('events')
      .update(updateData)
      .eq('id', req.params.id);

    res.redirect(`/events/${req.params.id}`);
  } catch (error) {
    console.error("Update Event Error:", error);
    res.redirect("/events");
  }
};

/* ===============================
   DELETE EVENT (ADMIN)
================================ */
exports.deleteEvent = async (req, res) => {
  try {
    await supabase.from('events').delete().eq('id', req.params.id);
    res.redirect("/events");
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.redirect("/events");
  }
};

/* ===============================
   MANUAL MOVE TO PAST (ADMIN)
================================ */
exports.moveEventToPast = async (req, res) => {
  try {
    await supabase
      .from('events')
      .update({ type: "past", registrationLink: null })
      .eq('id', req.params.id);

    res.redirect("/events");
  } catch (error) {
    console.error("Move Event Error:", error);
    res.redirect("/events");
  }
};

/* ===============================
   ADD REVIEW (PUBLIC – PAST EVENTS)
================================ */
exports.addReview = async (req, res) => {
  try {
    const { name, message } = req.body;
    const eventId = req.params.id;

    if (!name || !message) {
      return res.redirect(`/events/${eventId}`);
    }

    await supabase
      .from('reviews')
      .insert([{
        event: eventId,
        name,
        message,
      }]);

    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("Add Review Error:", error);
    res.redirect("/events");
  }
};

/* ===============================
   DELETE REVIEW (ADMIN)
================================ */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId, eventId } = req.params;

    await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.redirect("/events");
  }
};

/* ===============================
   DELETE Banner IMAGE
================================ */
exports.deleteBannerImage = async (req, res) => {
  try {
    await supabase
      .from('events')
      .update({ bannerImage: null })
      .eq('id', req.params.id);

    res.redirect(`/events/${req.params.id}`);
  } catch (error) {
    console.error("Delete Banner Error:", error);
    res.redirect("/events");
  }
};


/* ===============================
   ADD GALLERY IMAGES (ADMIN)
================================ */
exports.addGalleryImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.redirect(`/events/${req.params.id}`);
    }

    const images = req.files.map(
      file => `/uploads/events/${file.filename}`
    );

    const { data: event } = await supabase
      .from('events')
      .select('galleryImages')
      .eq('id', req.params.id)
      .single();

    if (event) {
      const updatedImages = [...(event.galleryImages || []), ...images];
      await supabase
        .from('events')
        .update({ galleryImages: updatedImages })
        .eq('id', req.params.id);
    }

    res.redirect(`/events/${req.params.id}`);
  } catch (error) {
    console.error("Add Gallery Error:", error);
    res.redirect("/events");
  }
};

/* ===============================
   DELETE SINGLE GALLERY IMAGE (ADMIN)
================================ */
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { eventId, index } = req.params;

    const { data: event } = await supabase
      .from('events')
      .select('galleryImages')
      .eq('id', eventId)
      .single();

    if (!event) return res.redirect("/events");

    const updatedImages = event.galleryImages || [];
    updatedImages.splice(index, 1);

    await supabase
      .from('events')
      .update({ galleryImages: updatedImages })
      .eq('id', eventId);

    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("Delete Gallery Image Error:", error);
    res.redirect("/events");
  }
};

// ADD COORDINATOR
exports.addCoordinator = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.redirect(`/events/${req.params.id}`);
    }

    const { data: event } = await supabase
      .from('events')
      .select('conductedBy')
      .eq('id', req.params.id)
      .single();

    if (event) {
      const updatedCoordinators = [...(event.conductedBy || []), { name, email }];
      await supabase
        .from('events')
        .update({ conductedBy: updatedCoordinators })
        .eq('id', req.params.id);
    }

    res.redirect(`/events/${req.params.id}`);
  } catch (error) {
    console.error("Add Coordinator Error:", error);
    res.redirect("/events");
  }
};

// delete coordinator
exports.deleteCoordinator = async (req, res) => {
  try {
    const { eventId, index } = req.params;

    const { data: event } = await supabase
      .from('events')
      .select('conductedBy')
      .eq('id', eventId)
      .single();

    if (!event) return res.redirect("/events");

    const updatedCoordinators = event.conductedBy || [];
    updatedCoordinators.splice(index, 1);

    await supabase
      .from('events')
      .update({ conductedBy: updatedCoordinators })
      .eq('id', eventId);

    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("Delete Coordinator Error:", error);
    res.redirect("/events");
  }
};

//add document
exports.addDocument = async (req, res) => {
  try {
    const { title, isPublic } = req.body;

    if (!req.file || !title) {
      return res.redirect(`/events/${req.params.id}`);
    }

    const { data: event } = await supabase
      .from('events')
      .select('documents')
      .eq('id', req.params.id)
      .single();

    if (event) {
      const newDoc = {
        title,
        file: `/uploads/events/${req.file.filename}`,
        isPublic: isPublic === "on",
      };
      const updatedDocuments = [...(event.documents || []), newDoc];

      await supabase
        .from('events')
        .update({ documents: updatedDocuments })
        .eq('id', req.params.id);
    }

    res.redirect(`/events/${req.params.id}`);
  } catch (error) {
    console.error("Add Document Error:", error);
    res.redirect("/events");
  }
};

//delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { eventId, index } = req.params;

    const { data: event } = await supabase
      .from('events')
      .select('documents')
      .eq('id', eventId)
      .single();

    if (!event) return res.redirect("/events");

    const updatedDocuments = event.documents || [];
    updatedDocuments.splice(index, 1);

    await supabase
      .from('events')
      .update({ documents: updatedDocuments })
      .eq('id', eventId);

    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("Delete Document Error:", error);
    res.redirect("/events");
  }
};




